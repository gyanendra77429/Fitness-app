export interface AndroidFile {
  filename: string;
  category: 'ui' | 'database' | 'viewmodel' | 'hardware' | 'config';
  code: string;
  description: string;
}

export const ANDROID_KOTLIN_FILES: AndroidFile[] = [
  {
    filename: 'MainActivity.kt',
    category: 'ui',
    description: 'Single Activity hosting Jetpack Compose navigation, Material 3 Scaffold, and system bar theming.',
    code: `package com.fitpulse.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.compose.*
import com.fitpulse.app.ui.navigation.FitPulseNavigation
import com.fitpulse.app.ui.navigation.FitPulseBottomBar
import com.fitpulse.app.ui.theme.FitPulseTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            FitPulseTheme {
                val navController = rememberNavController()
                val currentBackStack by navController.currentBackStackEntryAsState()
                val currentRoute = currentBackStack?.destination?.route

                Scaffold(
                    modifier = Modifier.fillMaxSize(),
                    bottomBar = {
                        FitPulseBottomBar(navController = navController, currentRoute = currentRoute)
                    }
                ) { innerPadding ->
                    FitPulseNavigation(
                        navController = navController,
                        modifier = Modifier.padding(innerPadding)
                    )
                }
            }
        }
    }
}`
  },
  {
    filename: 'FitPulseDatabase.kt',
    category: 'database',
    description: 'Room Database definition with DAOs for Workouts, Cardio, Daily Metrics, Meals, and Water.',
    code: `package com.fitpulse.app.data.local

import androidx.room.*
import com.fitpulse.app.data.local.dao.*
import com.fitpulse.app.data.local.entities.*

@Database(
    entities = [
        WorkoutSessionEntity::class,
        ExerciseLogEntity::class,
        WorkoutSetEntity::class,
        DailyMetricsEntity::class,
        CardioSessionEntity::class,
        MealEntity::class,
        WaterLogEntity::class,
        PersonalRecordEntity::class
    ],
    version = 1,
    exportSchema = false
)
@TypeConverters(FitPulseTypeConverters::class)
abstract class FitPulseDatabase : RoomDatabase() {
    abstract fun workoutDao(): WorkoutDao
    abstract fun dailyMetricsDao(): DailyMetricsDao
    abstract fun cardioDao(): CardioDao
    abstract fun nutritionDao(): NutritionDao
    abstract fun personalRecordDao(): PersonalRecordDao

    companion object {
        const val DATABASE_NAME = "fitpulse_room.db"
    }
}`
  },
  {
    filename: 'WorkoutDao.kt',
    category: 'database',
    description: 'Room DAO for storing and querying workout sessions, sets, and muscle volume analytics.',
    code: `package com.fitpulse.app.data.local.dao

import androidx.room.*
import com.fitpulse.app.data.local.entities.WorkoutSessionEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface WorkoutDao {
    @Query("SELECT * FROM workout_sessions ORDER BY timestamp DESC")
    fun getAllWorkoutSessions(): Flow<List<WorkoutSessionEntity>>

    @Query("SELECT * FROM workout_sessions WHERE date = :dateStr")
    fun getWorkoutsByDate(dateStr: String): Flow<List<WorkoutSessionEntity>>

    @Query("SELECT * FROM workout_sessions WHERE id = :sessionId LIMIT 1")
    suspend fun getWorkoutById(sessionId: String): WorkoutSessionEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertWorkoutSession(session: WorkoutSessionEntity)

    @Delete
    suspend fun deleteWorkoutSession(session: WorkoutSessionEntity)

    @Query("SELECT SUM(totalVolumeKg) FROM workout_sessions WHERE timestamp >= :sinceTimestamp")
    fun getTotalVolumeSince(sinceTimestamp: Long): Flow<Double?>
}`
  },
  {
    filename: 'WorkoutViewModel.kt',
    category: 'viewmodel',
    description: 'MVVM ViewModel managing StateFlow for active workouts, automated rest timers, and rep counts.',
    code: `package com.fitpulse.app.ui.workout

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.fitpulse.app.data.repository.WorkoutRepository
import com.fitpulse.app.hardware.SensorManagerHelper
import com.fitpulse.app.hardware.VoiceCoachManager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ActiveWorkoutUiState(
    val isWorkoutActive: Boolean = false,
    val routineName: String = "",
    val elapsedSeconds: Int = 0,
    val currentExerciseIndex: Int = 0,
    val isRestTimerRunning: Boolean = false,
    val restSecondsRemaining: Int = 60,
    val detectedReps: Int = 0,
    val isPhoneResting: Boolean = false
)

@HiltViewModel
class WorkoutViewModel @Inject constructor(
    private val repository: WorkoutRepository,
    private val sensorHelper: SensorManagerHelper,
    private val voiceCoach: VoiceCoachManager
) : ViewModel() {

    private val _uiState = MutableStateFlow(ActiveWorkoutUiState())
    val uiState: StateFlow<ActiveWorkoutUiState> = _uiState.asStateFlow()

    private var timerJob: Job? = null
    private var restJob: Job? = null

    init {
        // Observe Accelerometer motion reps
        viewModelScope.launch {
            sensorHelper.repFlow.collect { reps ->
                _uiState.update { it.copy(detectedReps = reps) }
            }
        }
        // Observe phone resting state (placed down on bench)
        viewModelScope.launch {
            sensorHelper.phoneRestingFlow.collect { isResting ->
                _uiState.update { it.copy(isPhoneResting = isResting) }
                if (isResting && !_uiState.value.isRestTimerRunning) {
                    startRestCountdown(60)
                }
            }
        }
    }

    fun startWorkout(routineName: String) {
        _uiState.update { it.copy(isWorkoutActive = true, routineName = routineName, elapsedSeconds = 0) }
        sensorHelper.startListening()
        voiceCoach.speak("Workout started: $routineName. Let's conquer it!")
        timerJob = viewModelScope.launch {
            while (true) {
                delay(1000)
                _uiState.update { it.copy(elapsedSeconds = it.elapsedSeconds + 1) }
            }
        }
    }

    fun completeSet(setNumber: Int, targetRestSeconds: Int = 60) {
        voiceCoach.speak("Set $setNumber complete! Starting rest.")
        startRestCountdown(targetRestSeconds)
    }

    private fun startRestCountdown(seconds: Int) {
        restJob?.cancel()
        _uiState.update { it.copy(isRestTimerRunning = true, restSecondsRemaining = seconds) }
        restJob = viewModelScope.launch {
            var remaining = seconds
            while (remaining > 0) {
                delay(1000)
                remaining--
                _uiState.update { it.copy(restSecondsRemaining = remaining) }
                if (remaining in 1..3) {
                    voiceCoach.speak("$remaining")
                } else if (remaining == 0) {
                    voiceCoach.speak("Rest complete! Time for the next set!")
                    _uiState.update { it.copy(isRestTimerRunning = false) }
                }
            }
        }
    }

    override fun onCleared() {
        super.onCleared()
        sensorHelper.stopListening()
    }
}`
  },
  {
    filename: 'SensorManagerHelper.kt',
    category: 'hardware',
    description: 'Hardware SensorManager listener for Accelerometer rep detection and Step Counter.',
    code: `package com.fitpulse.app.hardware

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlin.math.abs
import kotlin.math.sqrt

class SensorManagerHelper(context: Context) : SensorEventListener {

    private val sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager
    private val accelerometer: Sensor? = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
    private val stepCounter: Sensor? = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER)

    private val _repFlow = MutableSharedFlow<Int>(replay = 1)
    val repFlow = _repFlow.asSharedFlow()

    private val _phoneRestingFlow = MutableSharedFlow<Boolean>(replay = 1)
    val phoneRestingFlow = _phoneRestingFlow.asSharedFlow()

    private var repCount = 0
    private var isPeak = false
    private var lastRepTimestamp = 0L

    fun startListening() {
        accelerometer?.let {
            sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME)
        }
        stepCounter?.let {
            sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_UI)
        }
    }

    fun stopListening() {
        sensorManager.unregisterListener(this)
    }

    override fun onSensorChanged(event: SensorEvent?) {
        event ?: return
        if (event.sensor.type == Sensor.TYPE_ACCELEROMETER) {
            val x = event.values[0]
            val y = event.values[1]
            val z = event.values[2]
            val magnitude = sqrt(x * x + y * y + z * z)
            val deviation = abs(magnitude - SensorManager.GRAVITY_EARTH)

            val now = System.currentTimeMillis()
            // Peak rep detection logic
            if (deviation > 2.5f && !isPeak && now - lastRepTimestamp > 1100) {
                isPeak = true
            } else if (isPeak && deviation < 1.0f) {
                isPeak = false
                repCount++
                lastRepTimestamp = now
                _repFlow.tryEmit(repCount)
            }

            // Phone Resting on flat surface detector
            val isResting = deviation < 0.25f && abs(x) < 0.3f && abs(y) < 0.3f
            _phoneRestingFlow.tryEmit(isResting)
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
}`
  },
  {
    filename: 'VoiceCoachManager.kt',
    category: 'hardware',
    description: 'Android TextToSpeech engine wrapper with utterance queuing and speech rate adjustments.',
    code: `package com.fitpulse.app.hardware

import android.content.Context
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import java.util.Locale

class VoiceCoachManager(context: Context) : TextToSpeech.OnInitListener {

    private var tts: TextToSpeech? = TextToSpeech(context, this)
    private var isReady: Boolean = false

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            tts?.language = Locale.US
            tts?.setSpeechRate(1.05f)
            tts?.setPitch(1.0f)
            isReady = true
        }
    }

    fun speak(text: String, flushQueue: Boolean = true) {
        if (!isReady) return
        val queueMode = if (flushQueue) TextToSpeech.QUEUE_FLUSH else TextToSpeech.QUEUE_ADD
        tts?.speak(text, queueMode, null, text.hashCode().toString())
    }

    fun shutdown() {
        tts?.stop()
        tts?.shutdown()
        tts = null
    }
}`
  },
  {
    filename: 'DashboardScreen.kt',
    category: 'ui',
    description: 'Material 3 Compose Dashboard with Canvas radial progress rings and daily health cards.',
    code: `package com.fitpulse.app.ui.dashboard

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.dp

@Composable
fun DashboardProgressRing(
    progress: Float,
    targetValue: String,
    label: String,
    color: Color,
    modifier: Modifier = Modifier
) {
    Box(contentAlignment = Alignment.Center, modifier = modifier.size(120.dp)) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            // Track
            drawArc(
                color = color.copy(alpha = 0.15f),
                startAngle = -90f,
                sweepAngle = 360f,
                useCenter = false,
                style = Stroke(width = 10.dp.toPx(), cap = StrokeCap.Round)
            )
            // Progress
            drawArc(
                color = color,
                startAngle = -90f,
                sweepAngle = 360f * progress.coerceIn(0f, 1f),
                useCenter = false,
                style = Stroke(width = 10.dp.toPx(), cap = StrokeCap.Round)
            )
        }
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(text = targetValue, style = MaterialTheme.typography.titleMedium)
            Text(text = label, style = MaterialTheme.typography.bodySmall, color = Color.Gray)
        }
    }
}`
  },
  {
    filename: 'build.gradle.kts',
    category: 'config',
    description: 'Gradle configuration with Jetpack Compose Material 3, Room, Navigation, and Hilt dependencies.',
    code: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.kapt)
    alias(libs.plugins.hilt.android)
}

android {
    namespace = "com.fitpulse.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.fitpulse.app"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
    }

    buildFeatures {
        compose = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }
}

dependencies {
    // Compose Material 3
    implementation(platform("androidx.compose:compose-bom:2024.04.01"))
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.navigation:navigation-compose:2.8.0")

    // Room Database
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    kapt("androidx.room:room-compiler:2.6.1")

    // Lifecycle & Coroutines
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.4")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")
}`
  }
];
