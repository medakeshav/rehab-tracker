// Exercise Data for All Phases — v2.0 (Rehab Plan v2)
// Organized by time blocks: morning, throughout_day, evening, before_bed, bonus

const exercises = {
    phase1: [
        // ============================================================
        // MORNING ROUTINE (Daily, ~10 min)
        // ============================================================
        {
            id: 'decompression_morning',
            name: '1. 90/90 Wall Decompression',
            timeBlock: 'morning',
            exerciseType: 'timed',
            timerDuration: { left: 120, right: 120 },
            targetReps: '2 min hold',
            leftTarget: 120,
            rightTarget: 120,
            sets: 1,
            bilateral: true,
            category: 'Decompression',
            instructions: {
                title: '90/90 Wall Decompression',
                steps: [
                    'Lie on back, butt against wall',
                    'Legs up wall, knees bent 90°',
                    'Press lower back into floor',
                    'Relax hip flexors completely',
                    'Hold 2 minutes',
                    'Breathe deeply throughout',
                ],
                reps: '2 minute hold',
                sets: '1 set',
                why: 'Releases overnight hip flexor tightness, decompresses spine at L5-S1',
                tips: [
                    'Lower back should be flat against floor',
                    'Let gravity do the work',
                    'Focus on deep belly breathing',
                    'Great first thing in the morning',
                ],
            },
        },
        {
            id: 'hip_flexor_morning',
            name: '2. Hip Flexor Stretch (Couch)',
            timeBlock: 'morning',
            exerciseType: 'timed',
            timerDuration: { left: 90, right: 120 },
            targetReps: 'L: 90s | R: 2min',
            leftTarget: 90,
            rightTarget: 120,
            sets: 1,
            category: 'Hip Flexor',
            instructions: {
                title: 'Hip Flexor Stretch (Couch Stretch)',
                steps: [
                    'Kneel facing away from couch/bed',
                    'Place back foot on couch (shin on couch)',
                    'Front knee at 90°',
                    'Push hips FORWARD',
                    'Squeeze GLUTE of back leg (critical!)',
                    'Keep torso upright',
                    'Feel stretch in front of hip',
                ],
                reps: 'Left: 90 seconds | Right: 2 minutes',
                sets: '1 set each side',
                why: 'Tight hip flexors pull pelvis forward causing back pain when standing',
                tips: [
                    'Squeeze back glute to deepen stretch',
                    "Don't lean forward - stay upright",
                    'Should feel strong stretch in front of hip',
                    'Right side is tighter - needs more time',
                ],
            },
        },
        {
            id: 'short_foot',
            name: '3. Short Foot Exercise',
            timeBlock: 'morning',
            exerciseType: 'reps',
            targetReps: '15 each (22 right)',
            leftTarget: 15,
            rightTarget: 22,
            sets: 3,
            category: 'Foot & Ankle',
            instructions: {
                title: 'Short Foot Exercise (Arch Activation)',
                steps: [
                    'Sit on edge of bed, feet flat on floor',
                    'Pull arch UP without curling toes',
                    'Think: "Make foot shorter"',
                    'Hold for 5 seconds',
                    'Release and repeat',
                ],
                reps: '15 each foot (22 right foot)',
                sets: '3 sets each foot',
                why: 'Activates intrinsic foot muscles for arch support',
                tips: [
                    'Do barefoot',
                    'NO toe curling - toes stay relaxed',
                    'You should see arch lift',
                    'Foot should visibly shorten',
                ],
            },
        },
        {
            id: 'standing_posture_morning',
            name: '4. Standing Posture Practice',
            timeBlock: 'morning',
            exerciseType: 'timed',
            timerDuration: { left: 120, right: 120 },
            targetReps: '2 min hold',
            leftTarget: 120,
            rightTarget: 120,
            sets: 1,
            bilateral: true,
            category: 'Posture',
            progression: {
                1: { left: 120, right: 120 },
                2: { left: 300, right: 300 },
                3: { left: 600, right: 600 },
            },
            instructions: {
                title: 'Standing Posture Practice',
                steps: [
                    'Stand with feet hip-width apart',
                    'Unlock knees (slight bend)',
                    'Tuck pelvis slightly: "Zipper pulling up"',
                    'Squeeze glutes lightly (20%)',
                    'Engage core (30%): "Ribs down"',
                    'Shoulders back and down',
                    'Hold this position',
                ],
                reps: 'Week 1: 2 min | Week 2: 5 min | Week 3: 10 min',
                sets: '1 set',
                why: 'Your default standing posture causes pain - this retrains it',
                tips: [
                    'You should be able to breathe normally',
                    'Feel lower back flatten slightly',
                    'Build standing tolerance without back pain',
                    'Practice in front of mirror initially',
                ],
            },
        },

        // ============================================================
        // THROUGHOUT THE DAY (Quick-log, every 20-60 min)
        // ============================================================
        {
            id: 'hip_flexor_quick',
            name: 'Hip Flexor Stretch',
            timeBlock: 'throughout_day',
            exerciseType: 'quick_log',
            targetReps: 'Every 30 min sitting',
            leftTarget: 60,
            rightTarget: 90,
            sets: 1,
            category: 'Hip Flexor',
            quickLogTarget: 10,
            quickLogUnit: 'times',
            quickLogReminder: 'Every 30 min of sitting',
            instructions: {
                title: 'Hip Flexor Stretch (Throughout Day)',
                steps: [
                    'Kneeling lunge position',
                    'Back knee on cushion/pad',
                    'Front knee at 90°',
                    'Push hips forward',
                    'Squeeze back glute',
                    'Keep torso upright',
                    'Hold 60 sec left, 90 sec right',
                ],
                reps: 'Left: 60 sec | Right: 90 sec',
                sets: 'After every 30 minutes of sitting',
                why: 'Prevents hip flexor tightening that causes standing pain',
                tips: [
                    'This is the #1 priority throughout the day',
                    'Set a timer to remind you',
                    "Don't skip this - it fixes standing pain",
                    'Even 30 seconds helps',
                ],
            },
        },
        {
            id: 'glute_activation_quick',
            name: 'Glute Activation Drill',
            timeBlock: 'throughout_day',
            exerciseType: 'quick_log',
            targetReps: 'Every time you stand',
            leftTarget: 10,
            rightTarget: 10,
            sets: 1,
            bilateral: true,
            category: 'Glute Med',
            quickLogTarget: 20,
            quickLogUnit: 'times',
            quickLogReminder: 'Every time you stand up',
            instructions: {
                title: 'Glute Activation Drill',
                steps: [
                    'Stand up from chair',
                    'IMMEDIATELY squeeze both glutes (50% effort)',
                    'Tuck pelvis slightly',
                    'Feel lower back flatten',
                    'Hold 10 seconds',
                    'Release to 20% activation',
                    'Maintain while standing',
                ],
                reps: '10 second hold',
                sets: 'Every single time you stand (20-30x per day)',
                why: 'Teaches glutes to turn on automatically when standing',
                tips: [
                    'Make this a habit - every time you stand',
                    'Should become automatic within 2 weeks',
                    'The squeeze should be immediate',
                    'Feel your posture improve instantly',
                ],
            },
        },
        {
            id: 'standing_posture_quick',
            name: 'Standing Posture Practice',
            timeBlock: 'throughout_day',
            exerciseType: 'quick_log',
            targetReps: '10x per day, 2-5 min each',
            leftTarget: 120,
            rightTarget: 120,
            sets: 1,
            bilateral: true,
            category: 'Posture',
            quickLogTarget: 10,
            quickLogUnit: 'practices',
            quickLogReminder: 'Brushing teeth, waiting, elevator, etc.',
            instructions: {
                title: 'Standing Posture Practice (Throughout Day)',
                steps: [
                    'Whenever you find yourself standing:',
                    'Unlock knees (slight bend)',
                    'Tuck pelvis slightly',
                    'Squeeze glutes lightly (20%)',
                    'Engage core (30%)',
                    'Shoulders back and down',
                    'Hold for 2-5 minutes',
                ],
                reps: 'Week 1: 2 min | Week 2: 5 min | Week 3: 10 min',
                sets: '10 practices per day',
                why: 'Builds standing tolerance without back pain',
                tips: [
                    'Brushing teeth = 2 min practice',
                    'Waiting for coffee = 3 min',
                    'Elevator = 1-2 min',
                    'Grocery line = 3-5 min',
                ],
            },
        },
        {
            id: 'seated_clamshells_quick',
            name: 'Seated Clamshells',
            timeBlock: 'throughout_day',
            exerciseType: 'quick_log',
            targetReps: 'Every 20 min at desk',
            leftTarget: 20,
            rightTarget: 30,
            sets: 1,
            category: 'Glute Med',
            quickLogTarget: 15,
            quickLogUnit: 'times',
            quickLogReminder: 'Every 20 min at desk',
            instructions: {
                title: 'Seated Clamshells at Desk',
                steps: [
                    'Sit on edge of chair',
                    'Feet flat, hip-width apart',
                    'Knees slightly apart (10cm gap)',
                    'Keep feet planted',
                    'Push knees APART against invisible resistance',
                    'Feel SIDE of hips work',
                    'Hold 3 seconds',
                    'Repeat: 20 left, 30 right',
                ],
                reps: 'Left: 20 | Right: 30',
                sets: '1 set every 20 minutes at desk',
                why: 'Prevents glute med from shutting down during sitting',
                tips: [
                    'No one will notice you doing this',
                    'Push outward, not just apart',
                    'Feel the burn in side of hips',
                    'Great during meetings or calls',
                ],
            },
        },

        // ============================================================
        // EVENING WORKOUT (Daily except Wed/Sun, 25-30 min)
        // ============================================================
        {
            id: 'hip_flexor_warmup',
            name: '1. Hip Flexor Stretch (Warm-up)',
            timeBlock: 'evening',
            exerciseType: 'timed',
            timerDuration: { left: 90, right: 120 },
            targetReps: 'L: 90s | R: 2min',
            leftTarget: 90,
            rightTarget: 120,
            sets: 1,
            category: 'Hip Flexor',
            instructions: {
                title: 'Hip Flexor Stretch (Pre-Workout)',
                steps: [
                    'Kneeling lunge position (or couch stretch)',
                    'Back knee on cushion/pad',
                    'Front knee at 90°',
                    'Push hips forward',
                    'Squeeze back glute',
                    'Keep torso upright',
                    'Hold 90 sec left, 2 min right',
                ],
                reps: 'Left: 90 seconds | Right: 2 minutes',
                sets: '1 set each side',
                why: 'Pre-workout hip flexor release to protect L5-S1',
                tips: [
                    'Same technique as morning couch stretch',
                    'Can be done kneeling on floor instead',
                    'Squeeze back glute to deepen stretch',
                    'Breathe deeply',
                ],
            },
        },
        {
            id: 'dead_bug_holds',
            name: '2. Dead Bug Holds',
            timeBlock: 'evening',
            exerciseType: 'timed_holds',
            timerDuration: { left: 10, right: 15 },
            targetReps: '6 holds each side',
            leftTarget: 6,
            rightTarget: 6,
            sets: 1,
            category: 'Core',
            progression: {
                1: { left: 10, right: 15 },
                3: { left: 15, right: 20 },
                5: { left: 20, right: 30 },
            },
            instructions: {
                title: 'Dead Bug Holds (Core Endurance)',
                steps: [
                    'Lie on back, arms straight up',
                    'Knees at 90° (tabletop)',
                    'Press lower back into floor (CRITICAL)',
                    'Lower RIGHT arm + LEFT leg (hold)',
                    'Return to start',
                    'Lower LEFT arm + RIGHT leg (hold longer)',
                    'Return to start, repeat',
                ],
                reps: 'LEFT side: 10s holds | RIGHT side: 15s holds × 6 each',
                sets: '1 set (6 holds per side)',
                why: 'RIGHT core is weaker - extra hold time builds endurance asymmetrically',
                tips: [
                    'Lower back NEVER leaves floor',
                    "If back arches, don't go as low",
                    'Breathe normally during holds',
                    'RIGHT side working harder = fixing imbalance',
                ],
            },
        },
        {
            id: 'clamshells',
            name: '3. Clamshells',
            timeBlock: 'evening',
            exerciseType: 'reps',
            targetReps: '20 each (30 right)',
            leftTarget: 20,
            rightTarget: 30,
            sets: 3,
            category: 'Glute Med',
            instructions: {
                title: 'Clamshells (Glute Med Isolation)',
                steps: [
                    'Lie on LEFT side first (works RIGHT glute med)',
                    'Knees bent 90°',
                    'Stack hips directly on top of each other',
                    'Keep feet together',
                    'Lift top knee as high as possible',
                    'Squeeze glutes at top, hold 2 seconds',
                    'Lower with control',
                    'Complete 30 reps RIGHT, then 20 reps LEFT',
                ],
                reps: 'Left: 20 | Right: 30',
                sets: '3 sets',
                why: 'RIGHT glute med is weaker - more reps = more activation',
                tips: [
                    "Don't roll hips back",
                    'Feet stay glued together',
                    'Feel it in SIDE of hip',
                    'RIGHT side will fatigue more (good!)',
                ],
            },
        },
        {
            id: 'supine_glute_med',
            name: '4. Supine Glute Med (Band Push-Aparts)',
            timeBlock: 'evening',
            exerciseType: 'reps',
            targetReps: '20 each (30 right)',
            leftTarget: 20,
            rightTarget: 30,
            sets: 3,
            category: 'Glute Med',
            instructions: {
                title: 'Supine Glute Med Activation (Band Push-Aparts)',
                steps: [
                    'Lie on back, both knees bent',
                    'Feet flat on floor',
                    'Place resistance band above knees (or use hands)',
                    'Push knees APART against band',
                    'Feel SIDE of hips working',
                    'Hold 5 seconds at max width',
                    'Control return',
                    'Repeat',
                ],
                reps: 'Left: 20 | Right: 30',
                sets: '3 sets',
                why: 'Activates glute med with zero back stress',
                tips: [
                    'Keep lower back pressed into floor',
                    'Push knees apart, not just open',
                    'Feel burn in side of hips',
                    'Can use hands for resistance if no band',
                ],
            },
        },
        {
            id: 'glute_bridges',
            name: '5. Glute Bridges (Both Legs)',
            timeBlock: 'evening',
            exerciseType: 'reps',
            targetReps: '20',
            leftTarget: 20,
            rightTarget: 20,
            sets: 3,
            bilateral: true,
            category: 'Hip & Glute',
            instructions: {
                title: 'Glute Bridges (Both Legs)',
                steps: [
                    'Lie on back, knees bent, feet flat',
                    'Feet hip-width apart',
                    'Press through heels, lift hips up',
                    'Form straight line from shoulders to knees',
                    'Squeeze glutes HARD at top',
                    'Hold 3 seconds',
                    'Lower with control',
                ],
                reps: '20',
                sets: '3 sets',
                why: 'Builds posterior chain strength, safe for L5-S1',
                tips: [
                    "Don't arch lower back at top",
                    'Push through heels, not toes',
                    'Squeeze glutes, not hamstrings',
                    'Breathe at top',
                ],
            },
        },
        {
            id: 'single_leg_bridge',
            name: '6. Single-Leg Glute Bridge',
            timeBlock: 'evening',
            exerciseType: 'reps',
            targetReps: '12 each (18 right)',
            leftTarget: 12,
            rightTarget: 18,
            sets: 3,
            category: 'Hamstring',
            instructions: {
                title: 'Single-Leg Glute Bridge (Hamstring + Glute)',
                steps: [
                    'Lie on back, LEFT knee bent, foot flat',
                    'Extend RIGHT leg straight',
                    'Press through LEFT heel, lift hips',
                    "Keep hips level - don't let them drop",
                    'Squeeze RIGHT glute at top',
                    'Hold 2 seconds',
                    'Lower and repeat',
                    'Complete 18 reps RIGHT, then 12 LEFT',
                ],
                reps: 'Left: 12 | Right: 18',
                sets: '3 sets',
                why: 'RIGHT hamstring weaker - extra volume corrects asymmetry',
                tips: [
                    'RIGHT side will be MUCH harder (expected!)',
                    'Keep hips perfectly level',
                    'Extended leg stays straight',
                    'Drive through heel of grounded foot',
                ],
            },
        },
        {
            id: 'prone_hamstring_curls',
            name: '7. Prone Hamstring Curls',
            timeBlock: 'evening',
            exerciseType: 'reps',
            targetReps: '15 each (22 right)',
            leftTarget: 15,
            rightTarget: 22,
            sets: 3,
            category: 'Hamstring',
            instructions: {
                title: 'Prone Hamstring Curls (Hamstring Isolation)',
                steps: [
                    'Lie face down on floor/bed',
                    'Forehead on hands',
                    'Start with RIGHT leg (weaker)',
                    'Bend RIGHT knee, bring heel toward butt',
                    'Squeeze hamstring at top',
                    'Hold 2 seconds',
                    'Lower slowly (4 seconds)',
                    'Complete 22 reps RIGHT, then 15 LEFT',
                ],
                reps: 'Left: 15 | Right: 22',
                sets: '3 sets',
                why: 'RIGHT hamstring needs extra work - builds strength asymmetrically',
                tips: [
                    'Slow the lowering phase (4 seconds)',
                    'Squeeze hard at the top',
                    'Keep hips pressed into floor',
                    'Week 3+: add ankle weights or resistance band',
                ],
            },
        },
        {
            id: 'hip_abduction',
            name: '8. Side-Lying Hip Abduction',
            timeBlock: 'evening',
            exerciseType: 'reps',
            targetReps: '15 each (22 right)',
            leftTarget: 15,
            rightTarget: 22,
            sets: 3,
            category: 'Glute Med',
            instructions: {
                title: 'Side-Lying Hip Abduction (Glute Med)',
                steps: [
                    'Lie on LEFT side (works RIGHT glute med)',
                    'Bottom leg bent for stability',
                    'Top leg (RIGHT) straight',
                    'Toes pointing FORWARD (not up)',
                    'Lift leg up toward ceiling (30cm max)',
                    "Keep hips stacked - don't roll back",
                    'Hold 2 seconds at top',
                    'Lower with control',
                    'Complete 22 reps RIGHT, then 15 LEFT',
                ],
                reps: 'Left: 15 | Right: 22',
                sets: '3 sets',
                why: 'RIGHT glute med weaker - more reps = better activation',
                tips: [
                    'Toes forward, not toward ceiling',
                    "Don't go too high - quality over height",
                    'Feel burn in SIDE of hip',
                    'Keep body in straight line',
                ],
            },
        },
        {
            id: 'bird_dog_holds',
            name: '9. Bird Dog Holds',
            timeBlock: 'evening',
            exerciseType: 'timed_holds',
            timerDuration: { left: 15, right: 20 },
            targetReps: '3 holds each side',
            leftTarget: 3,
            rightTarget: 3,
            sets: 3,
            category: 'Core',
            progression: {
                1: { left: 15, right: 20, note: 'Arm only (no leg extension)' },
                2: { left: 15, right: 20, note: 'Leg only (no arm extension)' },
                3: { left: 15, right: 20, note: 'Opposite arm + leg' },
            },
            instructions: {
                title: 'Bird Dog Holds (Core + Posterior Chain)',
                steps: [
                    'Start on hands and knees (tabletop)',
                    'Hands under shoulders, knees under hips',
                    'Extend LEFT arm + RIGHT leg (works RIGHT core) - Hold 20 sec',
                    'Keep hips level, no rotation',
                    'Return, switch sides',
                    'Extend RIGHT arm + LEFT leg - Hold 15 sec',
                    'Return, repeat',
                ],
                reps: 'LEFT core: 15s holds | RIGHT core: 20s holds × 3 each',
                sets: '3 sets each combination',
                why: 'RIGHT core weaker - longer hold times build endurance',
                tips: [
                    "Don't let hips rotate or drop",
                    'Back stays flat, no sagging',
                    'Look down to keep neck neutral',
                    'Week 1: arm only, Week 2: leg only, Week 3+: full',
                ],
            },
        },
        {
            id: 'plank',
            name: '10. Plank',
            timeBlock: 'evening',
            exerciseType: 'timed',
            timerDuration: { left: 30, right: 30 },
            targetReps: '30 sec',
            leftTarget: 30,
            rightTarget: 30,
            sets: 3,
            bilateral: true,
            category: 'Core',
            progression: {
                1: { left: 30, right: 30, note: 'Knees down' },
                2: { left: 45, right: 45, note: 'Knees down' },
                3: { left: 60, right: 60, note: 'Knees down' },
                4: { left: 20, right: 20, note: 'Full plank (toes)' },
                5: { left: 30, right: 30, note: 'Full plank (toes)' },
                6: { left: 45, right: 45, note: 'Full plank (toes)' },
                7: { left: 60, right: 60, note: 'Full plank (toes)' },
            },
            instructions: {
                title: 'Plank (Core Endurance)',
                steps: [
                    'Forearms on ground, elbows under shoulders',
                    'Knees down (modified plank) for Weeks 1-3',
                    'Body in straight line from head to knees',
                    'Engage core (30%)',
                    'Squeeze glutes (20%)',
                    'Hold position, breathe normally',
                ],
                reps: 'Week 1: 30s | Week 2: 45s | Week 3: 60s (knees)',
                sets: '3 sets',
                why: 'Builds core endurance for standing tolerance',
                tips: [
                    "Don't let hips sag",
                    "Don't pike hips up",
                    'Stop if back hurts',
                    'Week 4+: transition to full plank from toes',
                ],
            },
        },
        {
            id: 'balance_wall',
            name: '11. Single-Leg Balance (Wall Support)',
            timeBlock: 'evening',
            exerciseType: 'timed',
            timerDuration: { left: 30, right: 45 },
            targetReps: 'L: 30s | R: 45s',
            leftTarget: 30,
            rightTarget: 45,
            sets: 3,
            category: 'Balance',
            instructions: {
                title: 'Single-Leg Balance (Wall Support)',
                steps: [
                    'Stand near wall or chair',
                    'Stand on RIGHT leg first (weaker)',
                    'Touch wall lightly with fingertips',
                    'Keep eyes open, focus on fixed point',
                    'Engage RIGHT glute med (feel side of hip)',
                    'Hold 45 seconds',
                    'Rest, switch legs',
                    'Stand on LEFT leg: 30 seconds',
                ],
                reps: 'Left: 30 sec | Right: 45 sec',
                sets: '3 sets each leg',
                why: 'RIGHT side needs more balance/proprioception work',
                tips: [
                    'Start with 2-3 fingers on wall',
                    'Progress to 1 finger as you improve',
                    'Keep hips level',
                    'RIGHT side will wobble more (normal)',
                ],
            },
        },
        {
            id: 'decompression_cooldown',
            name: '12. 90/90 Decompression (Cool-down)',
            timeBlock: 'evening',
            exerciseType: 'timed',
            timerDuration: { left: 150, right: 150 },
            targetReps: '2-3 min hold',
            leftTarget: 150,
            rightTarget: 150,
            sets: 1,
            bilateral: true,
            category: 'Decompression',
            instructions: {
                title: '90/90 Wall Decompression (Cool-down)',
                steps: [
                    'Lie on back, butt against wall',
                    'Legs up wall, knees bent 90°',
                    'Press lower back into floor',
                    'Relax hip flexors completely',
                    'Hold 2-3 minutes',
                    'Breathe deeply throughout',
                ],
                reps: '2-3 minute hold',
                sets: '1 set',
                why: 'Releases any hip flexor tightness from workout, decompresses L5-S1',
                tips: [
                    'Same as morning routine',
                    'Great cool-down after workout',
                    'Focus on relaxation',
                    'Let spine decompress naturally',
                ],
            },
        },

        // ============================================================
        // BEFORE BED (Daily, ~5 min)
        // ============================================================
        {
            id: 'hip_flexor_bed',
            name: '1. Hip Flexor Stretch (Before Bed)',
            timeBlock: 'before_bed',
            exerciseType: 'timed',
            timerDuration: { left: 60, right: 90 },
            targetReps: 'L: 60s | R: 90s',
            leftTarget: 60,
            rightTarget: 90,
            sets: 1,
            category: 'Hip Flexor',
            instructions: {
                title: 'Hip Flexor Stretch (Before Bed)',
                steps: [
                    'Kneeling lunge position',
                    'Back knee on cushion/pad',
                    'Front knee at 90°',
                    'Push hips forward',
                    'Squeeze back glute',
                    'Keep torso upright',
                    'Hold 60 sec left, 90 sec right',
                ],
                reps: 'Left: 60 sec | Right: 90 sec',
                sets: '1 set each side',
                why: 'Final release before sleep prevents morning tightness',
                tips: [
                    'Gentle stretch - not aggressive before bed',
                    'Focus on breathing and relaxation',
                    'Right side gets extra time',
                    'Should feel pleasant, not painful',
                ],
            },
        },
        {
            id: 'decompression_bed',
            name: '2. 90/90 Wall Position (Before Bed)',
            timeBlock: 'before_bed',
            exerciseType: 'timed',
            timerDuration: { left: 120, right: 120 },
            targetReps: '2 min hold',
            leftTarget: 120,
            rightTarget: 120,
            sets: 1,
            bilateral: true,
            category: 'Decompression',
            instructions: {
                title: '90/90 Wall Position (Before Bed)',
                steps: [
                    'Lie on back, butt against wall',
                    'Legs up wall, knees bent 90°',
                    'Press lower back into floor',
                    'Relax completely',
                    'Hold 2 minutes',
                    'Breathe deeply',
                ],
                reps: '2 minute hold',
                sets: '1 set',
                why: 'Decompresses spine before sleep, promotes recovery',
                tips: [
                    'Same as morning routine',
                    'Great for winding down',
                    'Can do in bed against headboard',
                    'Focus on deep breathing',
                ],
            },
        },

        // ============================================================
        // BONUS (Optional exercises from previous plan)
        // ============================================================
        {
            id: 'toe_yoga',
            name: 'Toe Yoga',
            timeBlock: 'bonus',
            exerciseType: 'reps',
            targetReps: '10 each direction',
            leftTarget: 10,
            rightTarget: 15,
            sets: 2,
            category: 'Foot & Ankle',
            instructions: {
                title: 'Toe Yoga (Toe Control)',
                steps: [
                    'Sit with feet flat on floor',
                    'Movement 1: Lift big toe only, keep other 4 toes down',
                    'Hold 2 seconds, release',
                    'Movement 2: Keep big toe down, lift other 4 toes',
                    'Hold 2 seconds, release',
                    'Alternate between movements',
                ],
                reps: '10 each direction, each foot (15 right)',
                sets: '2 sets',
                why: 'Improves individual toe control and arch stability',
                tips: [
                    'Do barefoot',
                    'Start slowly - this is HARD at first',
                    'Use your fingers to help initially if needed',
                    'Focus on isolating toe muscles',
                ],
            },
        },
        {
            id: 'towel_scrunch',
            name: 'Towel Scrunches',
            timeBlock: 'bonus',
            exerciseType: 'reps',
            targetReps: '20 each foot',
            leftTarget: 20,
            rightTarget: 30,
            sets: 2,
            category: 'Foot & Ankle',
            instructions: {
                title: 'Towel Scrunches',
                steps: [
                    'Place small towel flat on floor',
                    'Sit with bare feet on towel edge',
                    'Use toes to grip towel',
                    'Scrunch towel toward you',
                    'Release and reposition',
                    'Repeat until towel is bunched up',
                ],
                reps: '20 scrunches per foot (30 right)',
                sets: '2 sets',
                why: 'Strengthens foot flexors and arch muscles',
                tips: [
                    'Keep heel planted on ground',
                    'Use only toes to grip',
                    'Make sure arch stays engaged',
                    'Can add weight on towel for progression',
                ],
            },
        },
        {
            id: 'calf_raises',
            name: 'Calf Raises',
            timeBlock: 'bonus',
            exerciseType: 'reps',
            targetReps: '15-20',
            leftTarget: 15,
            rightTarget: 22,
            sets: 3,
            category: 'Foot & Ankle',
            instructions: {
                title: 'Calf Raises',
                steps: [
                    'Stand on edge of step (or flat floor)',
                    'Rise up on toes as high as possible',
                    'Hold at top for 2 seconds',
                    'Lower slowly, below step level if on step',
                    'Control the descent',
                ],
                reps: '15-20 (both feet or single leg)',
                sets: '3 sets',
                why: 'Supports arch, strengthens posterior chain, builds ankle stability',
                tips: [
                    'Full range of motion',
                    'Slow and controlled',
                    'Hold at top for 2 seconds',
                    'Progress to single leg',
                ],
            },
        },
        {
            id: 'ankle_mobility',
            name: 'Ankle Mobility',
            timeBlock: 'bonus',
            exerciseType: 'reps',
            targetReps: '15 each side',
            leftTarget: 15,
            rightTarget: 22,
            sets: 1,
            category: 'Mobility',
            instructions: {
                title: 'Ankle Mobility (Dorsiflexion)',
                steps: [
                    'Face wall, stand about 6 inches away',
                    'Place one foot forward',
                    'Push knee toward wall',
                    'Keep heel DOWN on floor',
                    'Feel stretch in calf and ankle',
                    'Hold 2 seconds, return',
                    'Repeat 15 times',
                ],
                reps: '15 each side',
                sets: '1 set',
                why: 'Limited ankle mobility causes compensations throughout chain',
                tips: [
                    'Heel MUST stay down',
                    'If heel lifts, move closer to wall',
                    'Aim to touch wall with knee',
                    'Do daily, especially before exercise',
                ],
            },
        },
        {
            id: 'piriformis_stretch',
            name: 'Piriformis Stretch',
            timeBlock: 'bonus',
            exerciseType: 'reps',
            targetReps: '30 sec hold',
            leftTarget: 30,
            rightTarget: 30,
            sets: 3,
            category: 'Mobility',
            instructions: {
                title: 'Piriformis Stretch (Figure-4)',
                steps: [
                    'Lie on back',
                    'Cross right ankle over left knee (figure-4)',
                    'Thread hands behind left thigh',
                    'Pull left knee toward chest',
                    'Feel stretch in right glute',
                    'Hold 30 seconds',
                    'Switch sides',
                ],
                reps: '30 seconds each side',
                sets: '3 sets',
                why: 'Relieves pressure on sciatic nerve, releases deep hip rotators',
                tips: [
                    'Keep crossed ankle flexed',
                    'Pull toward chest, not to side',
                    'Relax into stretch',
                    'Should feel deep in glute',
                ],
            },
        },
    ],

    phase2: [
        // ============================================================
        // PHASE 2 — MORNING ADDITIONS (Daily)
        // ============================================================
        {
            id: 'worlds_greatest_stretch',
            name: '3. World\'s Greatest Stretch',
            timeBlock: 'morning',
            exerciseType: 'reps',
            targetReps: 'L: 5 | R: 8',
            leftTarget: 5,
            rightTarget: 8,
            sets: 1,
            category: 'Mobility',
            instructions: {
                title: 'World\'s Greatest Stretch',
                steps: [
                    'Start in push-up position',
                    'Step RIGHT foot forward outside RIGHT hand',
                    'Drop back knee to ground',
                    'Reach RIGHT arm up toward ceiling (rotation)',
                    'Hold 3 seconds',
                    'Return hand to ground',
                    'Rock hips back (hamstring stretch)',
                    'Return to start',
                    'Complete 8 reps RIGHT side (weaker)',
                    'Switch: 5 reps LEFT side',
                ],
                reps: 'Left: 5 | Right: 8',
                sets: '1 set each side',
                why: 'Dynamic mobility for hip, spine, ankle — addresses multiple areas simultaneously',
                tips: [
                    'Keep back knee on ground for stability',
                    'Rotate through thoracic spine, not lower back',
                    'Feel the stretch through hip flexor, hamstring, and upper back',
                    'Move slowly and with control',
                ],
            },
        },
        {
            id: 'standing_glute_activation',
            name: '4. Standing Single-Leg Glute Activation',
            timeBlock: 'morning',
            exerciseType: 'reps',
            targetReps: 'L: 10 | R: 15',
            leftTarget: 10,
            rightTarget: 15,
            sets: 2,
            category: 'Glute Med',
            instructions: {
                title: 'Standing Single-Leg Glute Activation',
                steps: [
                    'Stand on RIGHT leg (weaker)',
                    'Hands on hips',
                    'Lift LEFT knee to 90°',
                    'Hold balance 3 seconds',
                    'Push LEFT knee OUT to side (like clamshell standing)',
                    'Feel RIGHT glute med engage',
                    'Return to center',
                    'Lower foot to ground',
                    'Complete 15 reps RIGHT leg standing',
                    'Switch: 10 reps LEFT leg standing',
                ],
                reps: 'Left: 10 | Right: 15',
                sets: '2 sets each leg',
                why: 'Functional glute med work in standing (now that core is stronger)',
                tips: [
                    'Focus on feeling the glute med of the standing leg',
                    'Keep hips level throughout',
                    'Use wall for balance initially if needed',
                    'RIGHT leg standing will be harder (expected)',
                ],
            },
        },

        // ============================================================
        // PHASE 2 — THROUGHOUT DAY ADDITION
        // ============================================================
        {
            id: 'mini_band_walks_quick',
            name: 'Mini Band Walks',
            timeBlock: 'throughout_day',
            exerciseType: 'quick_log',
            targetReps: '30 sec each direction',
            leftTarget: 10,
            rightTarget: 10,
            sets: 1,
            bilateral: true,
            category: 'Glute Med',
            quickLogTarget: 7,
            quickLogUnit: 'times',
            quickLogReminder: 'Every bathroom break',
            instructions: {
                title: 'Mini Band Walk at Bathroom Breaks',
                steps: [
                    'Place mini band above knees',
                    'Slight squat stance',
                    'Side-step RIGHT 10 steps',
                    'Side-step LEFT 10 steps',
                    'Maintain tension on band',
                    'Keep toes forward',
                ],
                reps: '10 steps each direction (30 seconds)',
                sets: 'Every bathroom break (6-8x per day)',
                why: 'Glute med activation in functional pattern',
                tips: [
                    'Keep constant tension on the band',
                    'Stay low in quarter squat',
                    'Toes point forward throughout',
                    'Feel burn in side of hips',
                ],
            },
        },

        // ============================================================
        // PHASE 2 — EVENING EXERCISES (5 days/week)
        // ============================================================
        {
            id: 'step_ups',
            name: '7. Step-Ups',
            targetReps: 'L: 12 | R: 18',
            leftTarget: 12,
            rightTarget: 18,
            sets: 3,
            category: 'Single-Leg Strength',
            timeBlock: 'evening',
            exerciseType: 'reps',
            progression: {
                9: { note: '6-8" step, bodyweight' },
                11: { note: '8-10" step, bodyweight' },
                13: { note: '10-12" step, bodyweight' },
                15: { note: '12" step, hold 2-5kg dumbbells' },
            },
            instructions: {
                title: 'Step-Ups (Single-Leg Strength)',
                steps: [
                    'Stand facing step/box',
                    'Place RIGHT foot on step (weaker leg)',
                    'Drive through RIGHT heel',
                    'Step up, bring LEFT leg to meet RIGHT',
                    'Stand tall at top',
                    'Step down with LEFT leg first (control)',
                    'RIGHT leg stays on step',
                    'Step down with RIGHT leg',
                    'Complete 18 reps RIGHT leg leading',
                    'Switch: 12 reps LEFT leg leading',
                ],
                reps: 'Left: 12 | Right: 18',
                sets: '3 sets each leg',
                why: 'Functional single-leg strength, reveals and corrects asymmetries',
                tips: [
                    'RIGHT leg will fatigue more (expected)',
                    'Drive through HEEL, not toes',
                    'Control the descent',
                    'Keep torso upright',
                    'No pushing off bottom foot',
                ],
            },
        },
        {
            id: 'split_squats',
            name: '8. Bulgarian Split Squats',
            targetReps: 'L: 10 | R: 15',
            leftTarget: 10,
            rightTarget: 15,
            sets: 3,
            category: 'Single-Leg Strength',
            timeBlock: 'evening',
            exerciseType: 'reps',
            progression: {
                9: { note: 'Bodyweight, partial depth' },
                11: { note: 'Bodyweight, full depth' },
                13: { note: 'Hold 2-5kg dumbbells each hand' },
                15: { note: 'Hold 5-8kg dumbbells each hand' },
            },
            instructions: {
                title: 'Bulgarian Split Squats (Advanced Single-Leg)',
                steps: [
                    'Stand facing away from bench (knee height)',
                    'Place LEFT foot on bench behind you (works RIGHT leg)',
                    'RIGHT foot 2-3 feet in front of bench',
                    'Lower into lunge position',
                    'RIGHT knee tracks over toes',
                    'Lower until RIGHT thigh parallel to ground',
                    'Drive through RIGHT heel to stand',
                    'Complete 15 reps RIGHT leg',
                    'Switch: 10 reps LEFT leg',
                ],
                reps: 'Left: 10 | Right: 15',
                sets: '3 sets each leg',
                why: 'Safer than heavy bilateral squats for L5-S1, builds massive single-leg strength',
                tips: [
                    'RIGHT leg will be MUCH harder',
                    'Front knee stays over toes',
                    'Torso stays upright',
                    'Back foot just for balance',
                    '90% of weight on front leg',
                ],
            },
        },
        {
            id: 'single_leg_deadlift',
            name: '9. Single-Leg Deadlift',
            targetReps: 'L: 10 | R: 15',
            leftTarget: 10,
            rightTarget: 15,
            sets: 3,
            category: 'Single-Leg Strength',
            timeBlock: 'evening',
            exerciseType: 'reps',
            progression: {
                9: { note: 'Hand reaches to mid-shin' },
                11: { note: 'Hand reaches to ankle/floor' },
                13: { note: 'Hold light dumbbell (2-5kg)' },
                15: { note: 'Increase weight to 5-8kg' },
            },
            instructions: {
                title: 'Single-Leg Deadlift (Posterior Chain)',
                steps: [
                    'Stand on RIGHT leg (weaker)',
                    'Slight bend in RIGHT knee',
                    'Hinge at hip, reach toward floor',
                    'LEFT leg extends behind for balance',
                    'Keep back straight (no rounding)',
                    'Feel stretch in RIGHT hamstring',
                    'Drive through RIGHT heel to stand',
                    'Squeeze RIGHT glute at top',
                    'Complete 15 reps RIGHT leg',
                    'Switch: 10 reps LEFT leg',
                ],
                reps: 'Left: 10 | Right: 15',
                sets: '3 sets each leg',
                why: 'Builds posterior chain in single-leg pattern, functional for daily life',
                tips: [
                    'RIGHT hamstring will be tighter initially',
                    'Back stays FLAT — no rounding',
                    'Extended leg just for balance',
                    'Feel it in standing leg hamstring/glute',
                    'Move slowly and controlled',
                ],
            },
        },
        {
            id: 'lateral_band_walks',
            name: '10. Lateral Band Walks',
            targetReps: '15 steps each direction',
            leftTarget: 15,
            rightTarget: 15,
            sets: 3,
            bilateral: true,
            category: 'Dynamic Stability',
            timeBlock: 'evening',
            exerciseType: 'reps',
            progression: {
                9: { note: 'Light band, quarter squat' },
                11: { note: 'Medium band, quarter squat' },
                13: { note: 'Medium band, half squat' },
                15: { note: 'Heavy band, half squat' },
            },
            instructions: {
                title: 'Lateral Band Walks (Dynamic Glute Med)',
                steps: [
                    'Place resistance band above knees',
                    'Slight squat stance (quarter squat)',
                    'Feet shoulder-width apart',
                    'Step RIGHT 15 steps',
                    'Maintain band tension (knees stay apart)',
                    'Toes always pointing forward',
                    'No hip dropping',
                    'Step LEFT 15 steps',
                    'Complete circuit',
                ],
                reps: '15 steps each direction',
                sets: '3 circuits',
                why: 'Glute med in functional, moving context — mimics lateral stability needs',
                tips: [
                    'Keep tension on band entire time',
                    'Don\'t let knees cave in',
                    'Toes forward always',
                    'Feel burn in SIDE of hips',
                    'RIGHT side works harder when stepping LEFT',
                ],
            },
        },
        {
            id: 'balance_reaches',
            name: '11. Single-Leg Balance Reaches',
            targetReps: 'L: 6 | R: 8 per direction',
            leftTarget: 6,
            rightTarget: 8,
            sets: 2,
            category: 'Dynamic Stability',
            timeBlock: 'evening',
            exerciseType: 'reps',
            instructions: {
                title: 'Single-Leg Balance Reaches (Dynamic Stability)',
                steps: [
                    'Stand on RIGHT leg (weaker)',
                    'Soft knee bend',
                    'Reach forward with LEFT hand to target',
                    'Touch ground/target',
                    'Return to standing',
                    'Reach to next direction (clockwise)',
                    'Complete all 8 directions: forward, diagonal forward-right, right, diagonal back-right, back, diagonal back-left, left, diagonal forward-left',
                    'RIGHT leg: 8 reps × 8 directions = 64 total reaches',
                    'Switch: LEFT leg: 6 reps × 8 directions = 48 total reaches',
                ],
                reps: 'Right leg: 8 per direction (64 total) | Left leg: 6 per direction (48 total)',
                sets: '2 sets each leg',
                why: 'Challenges stability in all planes, functional balance training',
                tips: [
                    'RIGHT leg will wobble more',
                    'Start with shallow reaches',
                    'Progress depth over weeks',
                    'Keep standing knee soft',
                    'Hip stays level',
                ],
            },
        },
        {
            id: 'goblet_squats',
            name: '12. Goblet Squats',
            targetReps: '12-15',
            leftTarget: 12,
            rightTarget: 12,
            sets: 3,
            bilateral: true,
            category: 'Controlled Loading',
            timeBlock: 'evening',
            exerciseType: 'reps',
            progression: {
                9: { note: '5-8kg, to parallel' },
                11: { note: '8-12kg, to parallel' },
                13: { note: '12-16kg, to parallel' },
                15: { note: '16-20kg, to parallel' },
            },
            instructions: {
                title: 'Goblet Squats (Controlled Bilateral Loading)',
                steps: [
                    'Hold kettlebell/dumbbell at chest',
                    'Feet shoulder-width apart',
                    'Squat down, elbows inside knees',
                    'Go to parallel (NOT below if back hurts)',
                    'Chest stays up',
                    'Drive through heels to stand',
                    'Squeeze glutes at top',
                ],
                reps: '12-15',
                sets: '3 sets',
                why: 'Safe squat pattern, builds legs without back compression',
                tips: [
                    'Stop at parallel — don\'t go deeper',
                    'If back hurts, reduce weight or depth',
                    'Chest stays proud',
                    'Elbows push knees out',
                    'Safe for L5-S1',
                ],
            },
        },
        {
            id: 'copenhagen_plank',
            name: '13. Copenhagen Plank',
            timeBlock: 'evening',
            exerciseType: 'timed',
            timerDuration: { left: 15, right: 25 },
            targetReps: 'L: 15s | R: 25s',
            leftTarget: 15,
            rightTarget: 25,
            sets: 2,
            category: 'Core',
            instructions: {
                title: 'Copenhagen Plank (Advanced Core + Adductor)',
                steps: [
                    'Side plank position, forearm down',
                    'Start with RIGHT side (weaker core)',
                    'Top leg (LEFT leg) on bench/chair',
                    'Bottom leg (RIGHT leg) off ground',
                    'Hold position — body in straight line',
                    'Hold 25 seconds RIGHT side',
                    'Switch: 15 seconds LEFT side',
                ],
                reps: 'Left: 15 seconds | Right: 25 seconds',
                sets: '2 sets each side',
                why: 'Advanced core stability, addresses RIGHT-side core weakness specifically',
                tips: [
                    'RIGHT side will be MUCH harder',
                    'Start with bench lower (easier)',
                    'Progress to higher bench',
                    'Don\'t let hips sag',
                    'Extremely challenging — work up to it',
                ],
            },
        },
        {
            id: 'single_leg_bridge_elevated',
            name: '14. Single-Leg Glute Bridge (Elevated)',
            timeBlock: 'evening',
            exerciseType: 'reps',
            targetReps: 'L: 12 | R: 18',
            leftTarget: 12,
            rightTarget: 18,
            sets: 3,
            category: 'Hamstring',
            instructions: {
                title: 'Single-Leg Glute Bridge — Elevated (Progression)',
                steps: [
                    'Lie on back',
                    'Place RIGHT foot on step/box (6-8 inch)',
                    'LEFT leg extended straight',
                    'Press through RIGHT heel, lift hips',
                    'Elevate hips HIGH',
                    'Hold 3 seconds',
                    'Lower with control',
                    'Complete 18 reps RIGHT leg',
                    'Switch: 12 reps LEFT leg',
                ],
                reps: 'Left: 12 | Right: 18',
                sets: '3 sets each leg',
                why: 'Harder variation increases RIGHT hamstring/glute strength beyond Phase 1',
                tips: [
                    'Keep hips perfectly level',
                    'Extended leg stays straight',
                    'Drive through heel of elevated foot',
                    'RIGHT side will be harder (expected)',
                    'Control the descent — no dropping',
                ],
            },
        },
        {
            id: 'bird_dog_movement',
            name: '15. Bird Dog with Movement',
            timeBlock: 'evening',
            exerciseType: 'reps',
            targetReps: 'L: 10 | R: 15',
            leftTarget: 10,
            rightTarget: 15,
            sets: 3,
            category: 'Core',
            instructions: {
                title: 'Bird Dog with Movement (Progression from Phase 1)',
                steps: [
                    'Hands and knees position',
                    'Extend LEFT arm + RIGHT leg (works RIGHT core)',
                    'Hold 3 seconds',
                    'CRUNCH: Bring elbow to knee under body',
                    'Extend back out',
                    'Complete 15 reps RIGHT core working',
                    'Switch: 10 reps LEFT core working',
                ],
                reps: 'Left: 10 | Right: 15',
                sets: '3 sets each combination',
                why: 'Adds dynamic movement to challenge RIGHT core more than static holds',
                tips: [
                    'Don\'t let hips rotate during crunch',
                    'Move slowly and with control',
                    'Full extension each rep',
                    'RIGHT side working harder = fixing imbalance',
                ],
            },
        },
        {
            id: 'pallof_press',
            name: '16. Pallof Press',
            timeBlock: 'evening',
            exerciseType: 'reps',
            targetReps: 'L: 12 | R: 18',
            leftTarget: 12,
            rightTarget: 18,
            sets: 3,
            category: 'Core',
            instructions: {
                title: 'Pallof Press (Anti-Rotation Core)',
                steps: [
                    'Attach resistance band to sturdy anchor (chest height)',
                    'Stand sideways to anchor, RIGHT side toward anchor (works LEFT core)',
                    'Hold band at chest with both hands',
                    'Press band straight forward',
                    'Band tries to rotate you — RESIST with core',
                    'Hold extended 3 seconds',
                    'Return to chest',
                    'Complete 12 reps LEFT core',
                    'Switch: RIGHT core gets 18 reps',
                ],
                reps: 'Left: 12 | Right: 18',
                sets: '3 sets each side',
                why: 'Functional anti-rotation strength, addresses RIGHT core weakness',
                tips: [
                    'RIGHT core emphasis: when LEFT side faces anchor, RIGHT core resists harder',
                    'Arms stay at chest height',
                    'Core does the work, not arms',
                    'Maintain neutral spine throughout',
                    'Progress to heavier band when form is solid',
                ],
            },
        },
    ],

    phase3: [
        // Phase 3 exercises kept intact but hidden in UI until updated
        {
            id: 'box_step_ups',
            name: '22. Box Step-Ups with Knee Drive',
            targetReps: '10 each (15 right)',
            leftTarget: 10,
            rightTarget: 15,
            sets: 3,
            category: 'Power & Plyometrics',
            timeBlock: 'evening',
            exerciseType: 'reps',
            instructions: {
                title: 'Box Step-Ups with Knee Drive',
                steps: [
                    'Use sturdy box (12-18 inches)',
                    'Place right foot fully on box',
                    'Explosively push through right heel',
                    'Drive left knee up toward chest',
                    'Stand tall at top',
                    'Step down with control',
                ],
                reps: '10 each leg (15 right)',
                sets: '3 sets',
                why: 'Builds explosive power, mimics running mechanics',
                tips: [
                    'Explosive drive up, controlled descent',
                    'Land softly when stepping down',
                    'Knee drive is key',
                    'All power from elevated leg',
                ],
            },
        },
        {
            id: 'single_leg_hops',
            name: '23. Single-Leg Hops',
            targetReps: '5-8 per direction',
            leftTarget: 5,
            rightTarget: 8,
            sets: 3,
            category: 'Power & Plyometrics',
            timeBlock: 'evening',
            exerciseType: 'reps',
            instructions: {
                title: 'Single-Leg Hops',
                steps: [
                    'Stand on one leg',
                    'Hop forward, landing on same leg',
                    'Absorb landing with bent knee',
                    'Immediately hop again',
                    'Complete 5-8 hops forward',
                    'Then hop backward, sideways',
                ],
                reps: '5-8 hops per direction (8 right)',
                sets: '3 sets',
                why: 'Plyometric training - builds reactive strength',
                tips: [
                    'Land softly with quiet feet',
                    'Knee should track straight',
                    'Start with small hops',
                    'Stop if pain develops',
                ],
            },
        },
        {
            id: 'farmers_carries',
            name: "24. Farmer's Carries",
            targetReps: '20m each side',
            leftTarget: 20,
            rightTarget: 20,
            sets: 3,
            bilateral: true,
            category: 'Power & Plyometrics',
            timeBlock: 'evening',
            exerciseType: 'reps',
            instructions: {
                title: "Farmer's Carries",
                steps: [
                    'Hold heavy dumbbell in one hand',
                    'Stand tall, shoulders back',
                    'Core braced, ribs down',
                    'Walk forward for 20 meters',
                    "Don't let body lean to weighted side",
                    'Keep shoulders level',
                    'Turn around, walk back',
                    'Switch hands, repeat',
                ],
                reps: '20 meters per side',
                sets: '3 sets',
                why: 'Unilateral load challenges core stability',
                tips: [
                    'Use challenging weight',
                    'Walk with normal gait',
                    'Squeeze handle hard',
                    'Fight the lean - stay upright',
                ],
            },
        },
    ],
};

/** Time block display names and order */
const TIME_BLOCKS = {
    morning: { label: 'Morning', shortLabel: 'AM', order: 0 },
    throughout_day: { label: 'Throughout Day', shortLabel: 'Day', order: 1 },
    evening: { label: 'Evening', shortLabel: 'PM', order: 2 },
    before_bed: { label: 'Before Bed', shortLabel: 'Bed', order: 3 },
    bonus: { label: 'Bonus', shortLabel: 'Extra', order: 4 },
};

// Get exercises for a specific phase (all time blocks)
function getExercisesForPhase(phase) {
    switch (phase) {
        case 1:
            return exercises.phase1;
        case 2:
            return [...exercises.phase1, ...exercises.phase2];
        case 3:
            return [...exercises.phase1, ...exercises.phase2, ...exercises.phase3];
        default:
            return exercises.phase1;
    }
}

/**
 * Get exercises filtered by phase and time block.
 * @param {number} phase - Phase number (1, 2, or 3)
 * @param {string} timeBlock - Time block key (morning, throughout_day, evening, before_bed, bonus)
 * @returns {Array} Filtered exercises
 */
function getExercisesForTimeBlock(phase, timeBlock) {
    const all = getExercisesForPhase(phase);
    return all.filter((ex) => ex.timeBlock === timeBlock);
}

/**
 * Return exercises for a phase with grouped exercises collapsed into
 * a single descriptor object. Non-grouped exercises pass through unchanged.
 * Each group descriptor has the shape:
 *   { isGroup: true, group: string, groupLabel: string, exercises: Exercise[] }
 */
function getVisibleExercisesForPhase(phase) {
    const all = getExercisesForPhase(phase);
    const result = [];
    const seenGroups = new Set();

    for (const ex of all) {
        if (ex.group) {
            if (!seenGroups.has(ex.group)) {
                seenGroups.add(ex.group);
                const groupMembers = all.filter((e) => e.group === ex.group);
                result.push({
                    isGroup: true,
                    group: ex.group,
                    groupLabel: ex.groupLabel,
                    exercises: groupMembers,
                });
            }
        } else {
            result.push(ex);
        }
    }
    return result;
}

/**
 * Get the category for an exercise by ID.
 * @param {string} id - Exercise ID
 * @returns {string|null} Category string or null if not found
 */
function getCategoryByExerciseId(id) {
    const all = [...exercises.phase1, ...exercises.phase2, ...exercises.phase3];
    const ex = all.find((e) => e.id === id);
    return ex ? ex.category : null;
}

/**
 * Get all unique time blocks that have exercises in a given phase.
 * @param {number} phase
 * @returns {string[]} Array of time block keys in display order
 */
function getTimeBlocksForPhase(phase) {
    const all = getExercisesForPhase(phase);
    const blocks = new Set(all.map((ex) => ex.timeBlock));
    return Object.keys(TIME_BLOCKS)
        .filter((key) => blocks.has(key))
        .sort((a, b) => TIME_BLOCKS[a].order - TIME_BLOCKS[b].order);
}

/**
 * Get exercises for a phase + time block, filtered by schedule rules.
 * For Phase 2+, evening exercises are filtered based on:
 * - Rest days: no evening exercises
 * - Maintenance days: Phase 1 maintained exercises + Phase 2 exercises
 * - Non-maintenance workout days: Phase 2 exercises only (no Phase 1 maintenance)
 * Morning, throughout_day, before_bed, bonus: always show all (no day filtering).
 *
 * @param {number} phase - Phase number
 * @param {string} timeBlock - Time block key
 * @param {Object} scheduleInfo - From getScheduleForDate()
 * @param {Object} scheduleConfig - CONFIG.SCHEDULE[phase]
 * @returns {Array} Filtered exercises, with maintenance overrides applied
 */
function getScheduledExercises(phase, timeBlock, scheduleInfo, scheduleConfig) {
    if (!scheduleConfig || phase === 1) {
        // Phase 1: no filtering, return all
        return getExercisesForTimeBlock(phase, timeBlock);
    }

    const all = getExercisesForTimeBlock(phase, timeBlock);

    // Non-evening blocks: always show everything
    if (timeBlock !== 'evening') {
        return all;
    }

    // Evening on a rest day: return empty (rest day card shown by UI)
    if (scheduleInfo.isRestDay) {
        return [];
    }

    // Evening on a workout day: filter Phase 1 exercises
    const phase1Ids = new Set(exercises.phase1.map((ex) => ex.id));
    const maintainedSet = new Set(scheduleConfig.maintainedExercises || []);
    const overrides = scheduleConfig.maintenanceOverrides || {};

    return all
        .filter((ex) => {
            const isPhase1Exercise = phase1Ids.has(ex.id);
            if (!isPhase1Exercise) {
                // Phase 2+ exercise: always show on workout days
                return true;
            }
            // Phase 1 exercise: only show if maintained AND it's a maintenance day
            return maintainedSet.has(ex.id) && scheduleInfo.isMaintenanceDay;
        })
        .map((ex) => {
            // Apply maintenance overrides to Phase 1 exercises
            if (phase1Ids.has(ex.id) && overrides[ex.id]) {
                return { ...ex, ...overrides[ex.id] };
            }
            return ex;
        });
}

export {
    exercises,
    TIME_BLOCKS,
    getExercisesForPhase,
    getExercisesForTimeBlock,
    getScheduledExercises,
    getVisibleExercisesForPhase,
    getCategoryByExerciseId,
    getTimeBlocksForPhase,
};
