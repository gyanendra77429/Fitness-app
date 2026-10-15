import { Exercise, WorkoutRoutine } from '../types/fitness';

export const DEFAULT_EXERCISES: Exercise[] = [
  // --- CALISTHENICS: CHEST ---
  {
    id: 'cal-pushup',
    name: 'Standard Push-Up',
    category: 'calisthenics',
    muscleGroup: 'chest',
    defaultSets: 4,
    defaultReps: 15,
    defaultWeight: 0,
    equipment: 'Bodyweight',
    instructions: [
      'Assume a high plank position with hands slightly wider than shoulders.',
      'Brace your core, squeeze glutes, and keep a straight line from heels to crown.',
      'Lower chest towards the floor until elbows reach 90 degrees or chest grazes floor.',
      'Press firmly through your palms to return to full lockout.'
    ],
    tips: 'Do not flare elbows past 45-60 degrees to protect shoulders.',
    difficulty: 'beginner',
    isBodyweight: true,
    caloriesPerRep: 0.35,
  },
  {
    id: 'cal-diamond-pushup',
    name: 'Diamond Push-Up',
    category: 'calisthenics',
    muscleGroup: 'chest',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 0,
    equipment: 'Bodyweight',
    instructions: [
      'Position hands close together directly beneath your chest, thumbs and index fingers touching in a diamond shape.',
      'Lower your torso with control while keeping elbows tucked closely to your ribs.',
      'Push back up explosively focusing on the inner chest and tricep contraction.'
    ],
    tips: 'If too challenging, elevate hands slightly or begin on knees.',
    difficulty: 'intermediate',
    isBodyweight: true,
    caloriesPerRep: 0.4,
  },
  {
    id: 'cal-dips',
    name: 'Parallel Bar Dips',
    category: 'calisthenics',
    muscleGroup: 'chest',
    defaultSets: 4,
    defaultReps: 10,
    defaultWeight: 0,
    equipment: 'Dip Bars / Sturdy Surface',
    instructions: [
      'Mount the dip bars with arms locked out and torso slightly leaned forward for chest emphasis.',
      'Inhale and lower body until shoulders are below elbows (approx 90-degree angle).',
      'Exhale and drive through palms to return to the starting support position.'
    ],
    tips: 'Leaning forward hits lower/mid chest; upright torso targets triceps.',
    difficulty: 'intermediate',
    isBodyweight: true,
    caloriesPerRep: 0.5,
  },
  {
    id: 'cal-decline-pushup',
    name: 'Decline Push-Up',
    category: 'calisthenics',
    muscleGroup: 'chest',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 0,
    equipment: 'Chair / Bench',
    instructions: [
      'Elevate feet on a sturdy bench or chair, placing hands on the ground.',
      'Keep core locked and lower chest down towards the floor.',
      'Press back up focusing on the clavicular (upper) head of pectoralis.'
    ],
    tips: 'Great for developing upper chest mass bodyweight-only.',
    difficulty: 'intermediate',
    isBodyweight: true,
    caloriesPerRep: 0.45,
  },

  // --- CALISTHENICS: BACK ---
  {
    id: 'cal-pullup',
    name: 'Standard Pull-Up',
    category: 'calisthenics',
    muscleGroup: 'back',
    defaultSets: 4,
    defaultReps: 8,
    defaultWeight: 0,
    equipment: 'Pull-Up Bar',
    instructions: [
      'Grip the bar slightly wider than shoulder width with an overhand (pronated) grip.',
      'Engage your lats, pull shoulder blades down and back (scapular pull).',
      'Drive elbows down towards hips until your chin clears the bar.',
      'Control the descent to dead hang position.'
    ],
    tips: 'Avoid swinging or kipping to maximize lat and bicep recruitment.',
    difficulty: 'intermediate',
    isBodyweight: true,
    caloriesPerRep: 0.6,
  },
  {
    id: 'cal-chinup',
    name: 'Chin-Up',
    category: 'calisthenics',
    muscleGroup: 'back',
    defaultSets: 3,
    defaultReps: 10,
    defaultWeight: 0,
    equipment: 'Pull-Up Bar',
    instructions: [
      'Grip bar shoulder-width with underhand (supinated) grip.',
      'Pull your chest up toward the bar, driving elbows down.',
      'Peak contraction at top, then lower with a controlled 2-second negative.'
    ],
    tips: 'Heavy bicep emphasis along with wide lat engagement.',
    difficulty: 'beginner',
    isBodyweight: true,
    caloriesPerRep: 0.55,
  },
  {
    id: 'cal-australian-pullup',
    name: 'Inverted Row (Australian Pull-Up)',
    category: 'calisthenics',
    muscleGroup: 'back',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 0,
    equipment: 'Low Bar / Table',
    instructions: [
      'Hang underneath a waist-height bar with heels on the ground.',
      'Maintain a rigid plank posture and pull your chest to the bar.',
      'Squeeze rhomboids and middle trapezius at top.'
    ],
    tips: 'Adjust foot distance to modify difficulty.',
    difficulty: 'beginner',
    isBodyweight: true,
    caloriesPerRep: 0.35,
  },
  {
    id: 'cal-muscleup',
    name: 'Bar Muscle-Up',
    category: 'calisthenics',
    muscleGroup: 'back',
    defaultSets: 3,
    defaultReps: 5,
    defaultWeight: 0,
    equipment: 'Pull-Up Bar',
    instructions: [
      'Initiate an explosive pull-up with slight hollow-body swing.',
      'Pull explosively past chest height, rapidly roll wrists over the bar into dip transition.',
      'Press out to full dip lockout above the bar.'
    ],
    tips: 'The king of calisthenics power moves. Master 15 clean pull-ups first.',
    difficulty: 'advanced',
    isBodyweight: true,
    caloriesPerRep: 1.2,
  },

  // --- CALISTHENICS: SHOULDERS & ARMS ---
  {
    id: 'cal-pike-pushup',
    name: 'Pike Push-Up',
    category: 'calisthenics',
    muscleGroup: 'shoulders',
    defaultSets: 4,
    defaultReps: 10,
    defaultWeight: 0,
    equipment: 'Bodyweight',
    instructions: [
      'Start in a pushup position and walk feet forward so hips are pushed high into an inverted V shape.',
      'Lower head diagonally forward in front of hands until crown lightly touches floor.',
      'Push back along the diagonal to starting pike.'
    ],
    tips: 'Keep hips stacked directly over shoulders as high as possible.',
    difficulty: 'intermediate',
    isBodyweight: true,
    caloriesPerRep: 0.45,
  },
  {
    id: 'cal-hspu',
    name: 'Handstand Push-Up (Wall)',
    category: 'calisthenics',
    muscleGroup: 'shoulders',
    defaultSets: 3,
    defaultReps: 6,
    defaultWeight: 0,
    equipment: 'Wall / Handstand mat',
    instructions: [
      'Kick up into a handstand facing away from or against a sturdy wall.',
      'Slowly lower head towards the floor in a tripod position.',
      'Drive overhead explosively back to full handstand lockout.'
    ],
    tips: 'Keep core tight and avoid severe banana back posture.',
    difficulty: 'advanced',
    isBodyweight: true,
    caloriesPerRep: 0.8,
  },

  // --- CALISTHENICS: LEGS ---
  {
    id: 'cal-pistol-squat',
    name: 'Pistol Squat (Single Leg)',
    category: 'calisthenics',
    muscleGroup: 'legs',
    defaultSets: 3,
    defaultReps: 6,
    defaultWeight: 0,
    equipment: 'Bodyweight',
    instructions: [
      'Stand on one leg, extending the other straight out in front of you.',
      'Hinge hips and squat deep on the standing leg until hamstring touches calf.',
      'Press powerfully through midfoot and heel to return to upright standing.'
    ],
    tips: 'Hold arms forward or hold a light counterweight for balance.',
    difficulty: 'advanced',
    isBodyweight: true,
    caloriesPerRep: 0.6,
  },
  {
    id: 'cal-squats',
    name: 'Air Squats',
    category: 'calisthenics',
    muscleGroup: 'legs',
    defaultSets: 4,
    defaultReps: 20,
    defaultWeight: 0,
    equipment: 'Bodyweight',
    instructions: [
      'Feet shoulder-width apart, toes flared slightly out.',
      'Send hips down and back, chest tall, knees tracking over toes.',
      'Break parallel depth, then stand up and squeeze glutes.'
    ],
    tips: 'Brisk cadence builds leg endurance and burns calories.',
    difficulty: 'beginner',
    isBodyweight: true,
    caloriesPerRep: 0.3,
  },
  {
    id: 'cal-lunges',
    name: 'Walking Lunges',
    category: 'calisthenics',
    muscleGroup: 'legs',
    defaultSets: 3,
    defaultReps: 20,
    defaultWeight: 0,
    equipment: 'Bodyweight',
    instructions: [
      'Take a large step forward, dropping back knee towards floor.',
      'Drive off front foot to transition seamlessly into the next step.',
      'Keep torso upright and core engaged.'
    ],
    tips: 'Hits quads, hamstrings, and glutes symmetrically.',
    difficulty: 'beginner',
    isBodyweight: true,
    caloriesPerRep: 0.35,
  },

  // --- CALISTHENICS: CORE ---
  {
    id: 'cal-hanging-leg-raise',
    name: 'Hanging Leg Raises',
    category: 'calisthenics',
    muscleGroup: 'core',
    defaultSets: 4,
    defaultReps: 12,
    defaultWeight: 0,
    equipment: 'Pull-Up Bar',
    instructions: [
      'Hang from bar with active shoulders.',
      'Keeping legs straight, hinge at hips and lift toes up to bar level or parallel.',
      'Control descent without allowing your body to swing like a pendulum.'
    ],
    tips: 'Roll pelvis slightly backward at top for maximum rectus abdominis activation.',
    difficulty: 'intermediate',
    isBodyweight: true,
    caloriesPerRep: 0.45,
  },
  {
    id: 'cal-plank',
    name: 'Forearm Plank',
    category: 'calisthenics',
    muscleGroup: 'core',
    defaultSets: 3,
    defaultReps: 60, // 60 seconds
    defaultWeight: 0,
    equipment: 'Floor Mat',
    instructions: [
      'Rest on forearms and toes with elbows beneath shoulders.',
      'Maintain straight spine from neck to ankles, squeeze glutes and abs.',
      'Breathe steadily while resisting any hip sagging.'
    ],
    tips: 'Reps represent seconds held in static position.',
    difficulty: 'beginner',
    isBodyweight: true,
    caloriesPerRep: 0.1,
  },
  {
    id: 'cal-lsit',
    name: 'L-Sit Hold',
    category: 'calisthenics',
    muscleGroup: 'core',
    defaultSets: 3,
    defaultReps: 20, // 20 seconds
    defaultWeight: 0,
    equipment: 'Parallettes / Floor',
    instructions: [
      'Press down into parallettes or floor, extending arms locked out.',
      'Lift body off ground and extend both legs straight forward parallel to floor.',
      'Lock knees, point toes, hold isometric tension.'
    ],
    tips: 'Brutal test of hip flexor compression, core, and tricep depression.',
    difficulty: 'advanced',
    isBodyweight: true,
    caloriesPerRep: 0.2,
  },

  // --- GYM: CHEST ---
  {
    id: 'gym-bench-press',
    name: 'Barbell Flat Bench Press',
    category: 'gym',
    muscleGroup: 'chest',
    defaultSets: 4,
    defaultReps: 8,
    defaultWeight: 75,
    equipment: 'Barbell & Bench',
    instructions: [
      'Lie flat on bench, eyes under bar, retract and pin scapulae.',
      'Unrack bar with full control, lower bar smoothly to mid-chest/sternum.',
      'Drive feet into floor and press the bar up along slight J-curve path to lockout.'
    ],
    tips: 'Maintain arch in lower back while keeping buttocks glued to bench.',
    difficulty: 'intermediate',
    isBodyweight: false,
    caloriesPerRep: 0.7,
  },
  {
    id: 'gym-incline-db-press',
    name: 'Incline Dumbbell Press',
    category: 'gym',
    muscleGroup: 'chest',
    defaultSets: 4,
    defaultReps: 10,
    defaultWeight: 26,
    equipment: 'Incline Bench & Dumbbells',
    instructions: [
      'Set bench to 30-45 degrees inclination.',
      'Kick dumbbells to shoulder level and press up to overhead lockout.',
      'Lower weights until dumbbells are level with upper chest, feeling stretch, then press.'
    ],
    tips: '30 degrees targets clavicular pec fibers with minimal front delt takeover.',
    difficulty: 'intermediate',
    isBodyweight: false,
    caloriesPerRep: 0.6,
  },
  {
    id: 'gym-cable-crossover',
    name: 'Cable Chest Flyes',
    category: 'gym',
    muscleGroup: 'chest',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 14,
    equipment: 'Dual Cable Station',
    instructions: [
      'Set pulleys at shoulder height, take a step forward into staggered stance.',
      'With slight bend in elbows, bring hands together in wide hugging arc.',
      'Squeeze pecs for 1 second at full contraction before smooth negative.'
    ],
    tips: 'Constant tension throughout the entire range of motion.',
    difficulty: 'beginner',
    isBodyweight: false,
    caloriesPerRep: 0.45,
  },

  // --- GYM: BACK ---
  {
    id: 'gym-deadlift',
    name: 'Barbell Conventional Deadlift',
    category: 'gym',
    muscleGroup: 'back',
    defaultSets: 4,
    defaultReps: 5,
    defaultWeight: 120,
    equipment: 'Barbell & Plates',
    instructions: [
      'Stand with midfoot under the bar, feet hip-width.',
      'Hinge hips back, grasp bar just outside shins, pull slack out of bar.',
      'Brace core 360 degrees, drive floor away with legs, lock hips out at top.'
    ],
    tips: 'Keep barbell skimming close against shins and thighs. Never round lumbar spine.',
    difficulty: 'advanced',
    isBodyweight: false,
    caloriesPerRep: 1.1,
  },
  {
    id: 'gym-barbell-row',
    name: 'Bent-Over Barbell Row',
    category: 'gym',
    muscleGroup: 'back',
    defaultSets: 4,
    defaultReps: 8,
    defaultWeight: 65,
    equipment: 'Barbell',
    instructions: [
      'Hinge at waist until torso is roughly 45 degrees, back flat.',
      'Pull barbell up to lower abdomen/bellybutton, leading with elbows.',
      'Squeeze lats and mid-back blades hard at peak, then lower under control.'
    ],
    tips: 'Avoid jerking torso up and down to cheat weight.',
    difficulty: 'intermediate',
    isBodyweight: false,
    caloriesPerRep: 0.65,
  },
  {
    id: 'gym-lat-pulldown',
    name: 'Lat Pulldown (Wide Grip)',
    category: 'gym',
    muscleGroup: 'back',
    defaultSets: 4,
    defaultReps: 10,
    defaultWeight: 55,
    equipment: 'Cable Pulldown Machine',
    instructions: [
      'Grip the wide bar with overhand grip, sit with thighs snug under pads.',
      'Lean back 10-15 degrees, pull bar down towards upper chest.',
      'Control return upwards allowing lats to achieve a full overhead stretch.'
    ],
    tips: 'Think about pulling elbows straight down into your back pockets.',
    difficulty: 'beginner',
    isBodyweight: false,
    caloriesPerRep: 0.5,
  },
  {
    id: 'gym-seated-cable-row',
    name: 'Seated Cable Row (Close Grip)',
    category: 'gym',
    muscleGroup: 'back',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 50,
    equipment: 'Low Row Cable Machine',
    instructions: [
      'Sit with knees slightly bent, grasp V-bar attachment.',
      'Maintain upright posture with natural lumbar curve.',
      'Pull handle to lower ribs while driving elbows backwards, retracting shoulder blades.'
    ],
    tips: 'Do not rock excessively forward and backward.',
    difficulty: 'beginner',
    isBodyweight: false,
    caloriesPerRep: 0.45,
  },

  // --- GYM: LEGS ---
  {
    id: 'gym-barbell-squat',
    name: 'Barbell Back Squat',
    category: 'gym',
    muscleGroup: 'legs',
    defaultSets: 4,
    defaultReps: 8,
    defaultWeight: 95,
    equipment: 'Barbell & Squat Rack',
    instructions: [
      'Rest barbell securely across upper traps, step back into shoulder-width stance.',
      'Brace abdomen, hinge hips and knees simultaneously to sit down between hips.',
      'Reach full depth below parallel, drive up forcefully spreading the floor.'
    ],
    tips: 'Keep chest proud and heels planted firmly throughout movement.',
    difficulty: 'intermediate',
    isBodyweight: false,
    caloriesPerRep: 0.9,
  },
  {
    id: 'gym-leg-press',
    name: '45-Degree Leg Press',
    category: 'gym',
    muscleGroup: 'legs',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 160,
    equipment: 'Leg Press Machine',
    instructions: [
      'Sit comfortably with lower back flat against backrest, feet shoulder-width on platform.',
      'Release safety handles, lower sled until knees form 90 degree angle.',
      'Press through heels to push sled up without violently locking knees out.'
    ],
    tips: 'Never lock knees hyperextended at the peak of the press.',
    difficulty: 'beginner',
    isBodyweight: false,
    caloriesPerRep: 0.6,
  },
  {
    id: 'gym-romanian-deadlift',
    name: 'Romanian Deadlift (RDL)',
    category: 'gym',
    muscleGroup: 'legs',
    defaultSets: 3,
    defaultReps: 10,
    defaultWeight: 80,
    equipment: 'Barbell / Dumbbells',
    instructions: [
      'Hold bar at hip height, soft knees unlocked.',
      'Push hips far backward like closing a car door with glutes, bar tracking down shins.',
      'Feel massive hamstring stretch, then snap hips forward to stand tall.'
    ],
    tips: 'Movement is a pure hip hinge, not a knee squat.',
    difficulty: 'intermediate',
    isBodyweight: false,
    caloriesPerRep: 0.7,
  },
  {
    id: 'gym-calf-raise',
    name: 'Standing Calf Raise',
    category: 'gym',
    muscleGroup: 'legs',
    defaultSets: 4,
    defaultReps: 15,
    defaultWeight: 60,
    equipment: 'Calf Raise Machine',
    instructions: [
      'Balls of feet on edge of platform, shoulders under pads.',
      'Lower heels below platform for deep gastrocnemius stretch.',
      'Drive onto tiptoes as high as possible, pausing for 1 full second at apex.'
    ],
    tips: 'Pause at top and bottom eliminates elastic bounce.',
    difficulty: 'beginner',
    isBodyweight: false,
    caloriesPerRep: 0.35,
  },

  // --- GYM: SHOULDERS ---
  {
    id: 'gym-overhead-press',
    name: 'Overhead Barbell Military Press',
    category: 'gym',
    muscleGroup: 'shoulders',
    defaultSets: 4,
    defaultReps: 8,
    defaultWeight: 45,
    equipment: 'Barbell',
    instructions: [
      'Clean or unrack barbell at clavicle height with palms facing forward.',
      'Squeeze glutes and quads to create solid base, press bar straight up overhead.',
      'Push head slightly forward under bar once bar passes forehead for full lockout.'
    ],
    tips: 'Strict press without knee bounce to build raw shoulder mass.',
    difficulty: 'intermediate',
    isBodyweight: false,
    caloriesPerRep: 0.65,
  },
  {
    id: 'gym-lateral-raise',
    name: 'Dumbbell Lateral Raise',
    category: 'gym',
    muscleGroup: 'shoulders',
    defaultSets: 4,
    defaultReps: 15,
    defaultWeight: 10,
    equipment: 'Dumbbells',
    instructions: [
      'Stand with dumbbells at sides, slight forward torso lean.',
      'Raise arms out to sides until parallel with floor, leading with elbows.',
      'Lower with control over 2 seconds.'
    ],
    tips: 'Keep pinkies slightly elevated to isolate lateral deltoid head.',
    difficulty: 'beginner',
    isBodyweight: false,
    caloriesPerRep: 0.35,
  },
  {
    id: 'gym-face-pull',
    name: 'Cable Face Pull',
    category: 'gym',
    muscleGroup: 'shoulders',
    defaultSets: 3,
    defaultReps: 15,
    defaultWeight: 20,
    equipment: 'Rope & Cable Machine',
    instructions: [
      'Attach rope to upper cable pulley, grasp with thumbs back.',
      'Pull rope towards eyes, separating hands and externally rotating shoulders.',
      'Squeeze rear deltoids and rotator cuff muscles firmly.'
    ],
    tips: 'Essential for shoulder longevity and postural correction.',
    difficulty: 'beginner',
    isBodyweight: false,
    caloriesPerRep: 0.35,
  },

  // --- GYM: ARMS ---
  {
    id: 'gym-bicep-curl',
    name: 'Dumbbell Alternating Bicep Curls',
    category: 'gym',
    muscleGroup: 'arms',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 14,
    equipment: 'Dumbbells',
    instructions: [
      'Stand with dumbbells in hands, palms facing thighs.',
      'Curl right dumbbell up, supinating wrist so palm faces shoulder at top.',
      'Squeeze peak bicep, lower slowly, and repeat on left side.'
    ],
    tips: 'Keep upper arms pinned strictly to your ribs.',
    difficulty: 'beginner',
    isBodyweight: false,
    caloriesPerRep: 0.4,
  },
  {
    id: 'gym-tricep-pushdown',
    name: 'Tricep Rope Pushdown',
    category: 'gym',
    muscleGroup: 'arms',
    defaultSets: 4,
    defaultReps: 12,
    defaultWeight: 25,
    equipment: 'Cable Machine & Rope',
    instructions: [
      'Grasp rope attachment with neutral grip, elbows tucked beside ribs.',
      'Extend arms downward, spreading rope ends apart at bottom for peak tricep contraction.',
      'Slowly allow forearms to rise back to 90 degrees.'
    ],
    tips: 'Spread the rope outwards at the bottom to maximize lateral tricep activation.',
    difficulty: 'beginner',
    isBodyweight: false,
    caloriesPerRep: 0.4,
  },
  {
    id: 'gym-skullcrusher',
    name: 'EZ-Bar Skullcrushers',
    category: 'gym',
    muscleGroup: 'arms',
    defaultSets: 3,
    defaultReps: 10,
    defaultWeight: 30,
    equipment: 'EZ-Curl Bar & Flat Bench',
    instructions: [
      'Lie flat holding EZ bar with arms extended straight above chest.',
      'Keeping upper arms stationary, bend elbows to lower bar toward forehead.',
      'Extend arms back to starting position using triceps power.'
    ],
    tips: 'Angle upper arms slightly back toward head to maintain constant tension.',
    difficulty: 'intermediate',
    isBodyweight: false,
    caloriesPerRep: 0.5,
  }
];

export const DEFAULT_ROUTINES: WorkoutRoutine[] = [
  {
    id: 'routine-cal-fullbody',
    name: 'Calisthenics Full Body Foundation',
    description: 'High-efficiency bodyweight master routine targeting chest, back, shoulders, legs, and core anywhere.',
    category: 'calisthenics',
    targetMuscles: ['chest', 'back', 'legs', 'core', 'shoulders'],
    exercises: [
      { exerciseId: 'cal-pushup', sets: 4, targetReps: 15, weightKg: 0 },
      { exerciseId: 'cal-pullup', sets: 4, targetReps: 8, weightKg: 0 },
      { exerciseId: 'cal-dips', sets: 3, targetReps: 10, weightKg: 0 },
      { exerciseId: 'cal-squats', sets: 4, targetReps: 20, weightKg: 0 },
      { exerciseId: 'cal-hanging-leg-raise', sets: 3, targetReps: 12, weightKg: 0 },
      { exerciseId: 'cal-plank', sets: 3, targetReps: 45, weightKg: 0 }
    ],
    estimatedMinutes: 45,
    tag: 'Bodyweight',
    intensity: 'Moderate'
  },
  {
    id: 'routine-cal-push-core',
    name: 'Upper Body Calisthenics & Core',
    description: 'Intense push progression with pike shoulders, diamond chest, and L-Sit isometric endurance.',
    category: 'calisthenics',
    targetMuscles: ['chest', 'shoulders', 'arms', 'core'],
    exercises: [
      { exerciseId: 'cal-diamond-pushup', sets: 3, targetReps: 12, weightKg: 0 },
      { exerciseId: 'cal-pike-pushup', sets: 4, targetReps: 10, weightKg: 0 },
      { exerciseId: 'cal-decline-pushup', sets: 3, targetReps: 12, weightKg: 0 },
      { exerciseId: 'cal-dips', sets: 3, targetReps: 12, weightKg: 0 },
      { exerciseId: 'cal-lsit', sets: 3, targetReps: 15, weightKg: 0 }
    ],
    estimatedMinutes: 35,
    tag: 'Hypertrophy',
    intensity: 'High'
  },
  {
    id: 'routine-cal-pull-legs',
    name: 'Back, Biceps & Pistol Legs',
    description: 'Explosive vertical pulling combined with unilateral single-leg pistol squats and inverted rows.',
    category: 'calisthenics',
    targetMuscles: ['back', 'arms', 'legs'],
    exercises: [
      { exerciseId: 'cal-pullup', sets: 4, targetReps: 8, weightKg: 0 },
      { exerciseId: 'cal-chinup', sets: 3, targetReps: 8, weightKg: 0 },
      { exerciseId: 'cal-australian-pullup', sets: 3, targetReps: 12, weightKg: 0 },
      { exerciseId: 'cal-pistol-squat', sets: 3, targetReps: 6, weightKg: 0 },
      { exerciseId: 'cal-lunges', sets: 3, targetReps: 20, weightKg: 0 }
    ],
    estimatedMinutes: 40,
    tag: 'Athletic',
    intensity: 'High'
  },
  {
    id: 'routine-gym-push',
    name: 'Gym Push Day (Chest / Delts / Triceps)',
    description: 'Heavy compound barbell press followed by incline dumbbell sculpt, lateral raises, and tricep burn.',
    category: 'gym',
    targetMuscles: ['chest', 'shoulders', 'arms'],
    exercises: [
      { exerciseId: 'gym-bench-press', sets: 4, targetReps: 8, weightKg: 75 },
      { exerciseId: 'gym-incline-db-press', sets: 4, targetReps: 10, weightKg: 26 },
      { exerciseId: 'gym-overhead-press', sets: 3, targetReps: 8, weightKg: 45 },
      { exerciseId: 'gym-lateral-raise', sets: 4, targetReps: 15, weightKg: 10 },
      { exerciseId: 'gym-tricep-pushdown', sets: 3, targetReps: 12, weightKg: 25 }
    ],
    estimatedMinutes: 55,
    tag: 'Muscle Mass',
    intensity: 'High'
  },
  {
    id: 'routine-gym-pull',
    name: 'Gym Pull Day (Lats / Upper Back / Biceps)',
    description: 'Heavy deadlifts, barbell rows, lat pulldowns, face pulls, and dumbbell bicep curls.',
    category: 'gym',
    targetMuscles: ['back', 'shoulders', 'arms'],
    exercises: [
      { exerciseId: 'gym-deadlift', sets: 4, targetReps: 5, weightKg: 120 },
      { exerciseId: 'gym-barbell-row', sets: 4, targetReps: 8, weightKg: 65 },
      { exerciseId: 'gym-lat-pulldown', sets: 3, targetReps: 10, weightKg: 55 },
      { exerciseId: 'gym-face-pull', sets: 3, targetReps: 15, weightKg: 20 },
      { exerciseId: 'gym-bicep-curl', sets: 3, targetReps: 12, weightKg: 14 }
    ],
    estimatedMinutes: 50,
    tag: 'Strength',
    intensity: 'High'
  },
  {
    id: 'routine-gym-legs',
    name: 'Gym Leg Day Blitz (Quads / Hams / Calves)',
    description: 'Back squats, leg press quad overload, romanian deadlifts for hamstrings, and standing calf raises.',
    category: 'gym',
    targetMuscles: ['legs'],
    exercises: [
      { exerciseId: 'gym-barbell-squat', sets: 4, targetReps: 8, weightKg: 95 },
      { exerciseId: 'gym-leg-press', sets: 4, targetReps: 12, weightKg: 160 },
      { exerciseId: 'gym-romanian-deadlift', sets: 3, targetReps: 10, weightKg: 80 },
      { exerciseId: 'gym-calf-raise', sets: 4, targetReps: 15, weightKg: 60 }
    ],
    estimatedMinutes: 50,
    tag: 'Hypertrophy',
    intensity: 'Extreme'
  }
];
