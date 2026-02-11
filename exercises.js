// Exercise Data for All Phases

const exercises = {
    phase1: [
        {
            id: 'short_foot',
            name: '1. Short Foot Exercise',
            targetReps: '15 each (22 right)',
            leftTarget: 15,
            rightTarget: 22,
            sets: 3,
            category: 'Foot & Ankle',
            instructions: {
                title: 'Short Foot Exercise (Arch Activation)',
                steps: [
                    'Sit or stand with feet flat on floor',
                    'Pull arch up without curling toes',
                    'Think: "Make foot shorter"',
                    'Hold for 5 seconds',
                    'Release and repeat'
                ],
                reps: '15 each foot (22 right foot)',
                sets: '3 sets',
                why: 'Activates intrinsic foot muscles that support arch',
                tips: [
                    'Do barefoot, 2x daily',
                    'NO toe curling - toes stay relaxed',
                    'You should see arch lift',
                    'Foot should visibly shorten'
                ]
            }
        },
        {
            id: 'toe_yoga',
            name: '2. Toe Yoga',
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
                    'Alternate between movements'
                ],
                reps: '10 each direction, each foot (15 right)',
                sets: '2 sets',
                why: 'Improves individual toe control and arch stability',
                tips: [
                    'Do barefoot',
                    'Start slowly - this is HARD at first',
                    'Use your fingers to help initially if needed',
                    'Focus on isolating toe muscles'
                ]
            }
        },
        {
            id: 'towel_scrunch',
            name: '3. Towel Scrunches',
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
                    'Repeat until towel is bunched up'
                ],
                reps: '20 scrunches per foot (30 right)',
                sets: '2 sets',
                why: 'Strengthens foot flexors and arch muscles',
                tips: [
                    'Keep heel planted on ground',
                    'Use only toes to grip',
                    'Make sure arch stays engaged',
                    'Can add weight on towel for progression'
                ]
            }
        },
        {
            id: 'balance_level1',
            name: '4a. Balance: Eyes Open + Support',
            targetReps: '30 sec each (45 right)',
            leftTarget: 30,
            rightTarget: 45,
            sets: 3,
            category: 'Balance',
            progressionLevel: 1,
            instructions: {
                title: 'Single-Leg Balance: Level 1 (Easiest)',
                steps: [
                    'Stand near wall or chair for support',
                    'Stand on one leg, other leg bent at knee',
                    'Touch support lightly with fingertips',
                    'Keep eyes open, focus on fixed point',
                    'Hold for 30 seconds (45 seconds right leg)',
                    'Rest and switch legs'
                ],
                reps: '30 seconds each leg (45 right)',
                sets: '3 sets per leg',
                why: 'Rebuilds proprioception and ankle stability',
                tips: [
                    'Start with 2-3 fingers on support',
                    'Progress to 1 finger as you improve',
                    'Keep hips level',
                    'Engage your core',
                    'Breathe normally'
                ]
            }
        },
        {
            id: 'balance_level2',
            name: '4b. Balance: Eyes Open + No Support',
            targetReps: '30 sec each (45 right)',
            leftTarget: 30,
            rightTarget: 45,
            sets: 3,
            category: 'Balance',
            progressionLevel: 2,
            instructions: {
                title: 'Single-Leg Balance: Level 2',
                steps: [
                    'Stand in middle of room, away from support',
                    'Stand on one leg, other leg bent at knee',
                    'Arms out to sides for balance if needed',
                    'Keep eyes open, focus on fixed point',
                    'Hold for 30 seconds (45 seconds right leg)',
                    'Rest and switch legs'
                ],
                reps: '30 seconds each leg (45 right)',
                sets: '3 sets per leg',
                why: 'Builds independent balance and proprioception',
                tips: [
                    'Have support nearby just in case',
                    'Gradually reduce arm movement',
                    'If wobbling, focus harder on fixed point',
                    'Core should stay engaged'
                ]
            },
        },
        {
            id: 'balance_level3',
            name: '4c. Balance: Eyes Closed + Support',
            targetReps: '20 sec each (30 right)',
            leftTarget: 20,
            rightTarget: 30,
            sets: 3,
            category: 'Balance',
            progressionLevel: 3,
            instructions: {
                title: 'Single-Leg Balance: Level 3 (Intermediate)',
                steps: [
                    'Stand near wall or chair for support',
                    'Stand on one leg, touch support lightly',
                    'Close your eyes',
                    'Hold for 20 seconds (30 seconds right leg)',
                    'Open eyes and rest',
                    'Switch legs'
                ],
                reps: '20 seconds each leg (30 right)',
                sets: '3 sets per leg',
                why: 'Challenges vestibular system, improves proprioception without visual cues',
                tips: [
                    'This is MUCH harder than it sounds',
                    'Touch support with 1-2 fingers',
                    'Stay relaxed, breathe normally',
                    'Don\'t worry if you need to peek at first'
                ]
            },
        },
        {
            id: 'balance_level4',
            name: '4d. Balance: Eyes Closed + No Support',
            targetReps: '15 sec each (22 right)',
            leftTarget: 15,
            rightTarget: 22,
            sets: 3,
            category: 'Balance',
            progressionLevel: 4,
            instructions: {
                title: 'Single-Leg Balance: Level 4 (Advanced)',
                steps: [
                    'Stand in middle of room, arms at sides',
                    'Stand on one leg',
                    'Close your eyes completely',
                    'Hold for 15 seconds (22 seconds right leg)',
                    'Open eyes and rest',
                    'Switch legs'
                ],
                reps: '15 seconds each leg (22 right)',
                sets: '3 sets per leg',
                why: 'Maximum proprioception challenge, elite balance',
                tips: [
                    'Expert level - be patient',
                    'Have support very nearby',
                    'Perfect posture is key',
                    'Even 5 seconds is good initially',
                    'No shame in opening eyes if needed'
                ]
            },
        },
        {
            id: 'balance_level5',
            name: '4e. Balance: On Pillow/Foam',
            targetReps: '15 sec each (22 right)',
            leftTarget: 15,
            rightTarget: 22,
            sets: 3,
            category: 'Balance',
            progressionLevel: 5,
            instructions: {
                title: 'Single-Leg Balance: Level 5 (Expert)',
                steps: [
                    'Place foam pad or pillow on floor',
                    'Stand on soft surface with one leg',
                    'Eyes open initially',
                    'Progress to eyes closed when ready',
                    'Hold for 15 seconds (22 seconds right leg)',
                    'Step off carefully and switch legs'
                ],
                reps: '15 seconds each leg (22 right)',
                sets: '3 sets per leg',
                why: 'Ultimate proprioception challenge, unstable surface forces maximum ankle and foot engagement',
                tips: [
                    'Most challenging level',
                    'Start with eyes open',
                    'Use balance pad or thick pillow',
                    'Progress to eyes closed only when very stable',
                    'This will really expose asymmetries'
                ]
            },
        },
        {
            id: 'calf_raises',
            name: '5. Calf Raises',
            targetReps: '15-20',
            leftTarget: 15,
            rightTarget: 22,
            sets: 3,
            instructions: {
                title: 'Calf Raises',
                steps: [
                    'Stand on edge of step (or flat floor)',
                    'Rise up on toes as high as possible',
                    'Hold at top for 2 seconds',
                    'Lower slowly, below step level if on step',
                    'Control the descent'
                ],
                reps: '15-20 (Week 1-4: Both feet, Week 5-8: Single leg)',
                sets: '3 sets',
                why: 'Supports arch, strengthens posterior chain, builds ankle stability',
                tips: [
                    'Full range of motion',
                    'Slow and controlled',
                    'Hold at top for 2 seconds',
                    'Progress to single leg Week 5+',
                    'Right leg gets extra set'
                ]
            },
            category: 'Foot & Ankle'
        },
        {
            id: 'clamshells',
            name: '6. Clamshells',
            targetReps: '20 each (30 right)',
            leftTarget: 20,
            rightTarget: 30,
            sets: 3,
            instructions: {
                title: 'Clamshells',
                steps: [
                    'Lie on side, knees bent 90°',
                    'Stack hips directly on top of each other',
                    'Keep feet together',
                    'Lift top knee as high as possible',
                    'Squeeze glutes at top',
                    'Lower with control'
                ],
                reps: '20 each side (30 right side)',
                sets: '3 sets',
                why: 'Glute med weakness causes pronation and knee instability - KEY EXERCISE',
                tips: [
                    'Don\'t roll hips back',
                    'Feet stay glued together',
                    'Feel it in side of hip/glute',
                    'Add resistance band above knees Week 5+',
                    'Keep core engaged'
                ]
            },
            category: 'Hip & Glute'
        },
        {
            id: 'hip_abduction',
            name: '7. Side-Lying Hip Abduction',
            targetReps: '15 each (22 right)',
            leftTarget: 15,
            rightTarget: 22,
            sets: 3,
            instructions: {
                title: 'Side-Lying Hip Abduction',
                steps: [
                    'Lie on side, bottom leg bent for stability',
                    'Top leg straight, toes pointing forward (NOT up)',
                    'Lift top leg up toward ceiling',
                    'Keep hips stacked, don\'t roll back',
                    'Lower with control'
                ],
                reps: '15 each side (22 right side)',
                sets: '3 sets',
                why: 'Strengthens hip stabilizers, particularly glute med and glute min',
                tips: [
                    'Toes forward, not toward ceiling',
                    'Don\'t go too high - quality over height',
                    'Feel burn in side of hip',
                    'Keep body in straight line',
                    'No swinging or momentum'
                ]
            },
            category: 'Hip & Glute'
        },
        {
            id: 'glute_bridges',
            name: '8. Glute Bridges (Both Legs)',
            targetReps: '20',
            leftTarget: 20,
            rightTarget: 20,
            sets: 3,
            bilateral: true,
            instructions: {
                title: 'Glute Bridges (Both Legs)',
                steps: [
                    'Lie on back, knees bent, feet flat',
                    'Feet hip-width apart',
                    'Press through heels, lift hips up',
                    'Form straight line from shoulders to knees',
                    'Squeeze glutes hard at top',
                    'Hold 3 seconds',
                    'Lower with control'
                ],
                reps: '20',
                sets: '3 sets',
                why: 'Activates glutes, safe for back, fundamental posterior chain movement',
                tips: [
                    'Don\'t arch lower back at top',
                    'Push through heels, not toes',
                    'Squeeze glutes, not hamstrings',
                    'Ribs stay down',
                    'Breathe at top'
                ]
            },
            category: 'Hip & Glute'
        },
        {
            id: 'single_leg_bridge',
            name: '9. Single-Leg Glute Bridge',
            targetReps: '12 each (18 right)',
            leftTarget: 12,
            rightTarget: 18,
            sets: 3,
            instructions: {
                title: 'Single-Leg Glute Bridge',
                steps: [
                    'Lie on back, one knee bent, foot flat',
                    'Extend other leg straight',
                    'Press through grounded heel, lift hips',
                    'Keep hips level - don\'t let them drop',
                    'Squeeze glute at top',
                    'Hold 2 seconds',
                    'Lower and repeat'
                ],
                reps: '12 each leg (18 right) - Start Week 5',
                sets: '3 sets',
                why: 'Exposes and corrects asymmetries, advanced glute activation',
                tips: [
                    'This WILL show your weak side',
                    'Keep hips perfectly level',
                    'Extended leg stays straight',
                    'Drive through heel of grounded foot',
                    'Right side will be harder initially'
                ]
            },
            category: 'Hip & Glute'
        },
        {
            id: 'dead_bug',
            name: '10. Dead Bug',
            targetReps: '12 each side',
            leftTarget: 12,
            rightTarget: 12,
            sets: 3,
            instructions: {
                title: 'Dead Bug',
                steps: [
                    'Lie on back, arms straight up toward ceiling',
                    'Bring knees up to 90° (tabletop position)',
                    'Press lower back into floor',
                    'Lower opposite arm and leg simultaneously',
                    'Hover just above floor',
                    'Return to start, switch sides'
                ],
                reps: '12 each side (alternating)',
                sets: '3 sets',
                why: 'Core stability without spine loading - perfect for L5-S1 protection',
                tips: [
                    'Lower back NEVER leaves floor',
                    'If back arches, don\'t go as low',
                    'Breathe out as you extend',
                    'Move slowly and controlled',
                    'This protects your disc!'
                ]
            },
            category: 'Core'
        },
        {
            id: 'bird_dog',
            name: '11. Bird Dog',
            targetReps: '10 each (15 right)',
            leftTarget: 10,
            rightTarget: 15,
            sets: 3,
            instructions: {
                title: 'Bird Dog',
                steps: [
                    'Start on hands and knees (tabletop)',
                    'Hands under shoulders, knees under hips',
                    'Extend opposite arm and leg simultaneously',
                    'Arm and leg parallel to ground',
                    'Hold 5 seconds',
                    'Keep hips level, no rotation',
                    'Return and switch sides'
                ],
                reps: '10 each side (15 right side)',
                sets: '3 sets',
                why: 'Posterior chain + stability, teaches anti-rotation',
                tips: [
                    'Don\'t let hips rotate or drop',
                    'Back stays flat, no sagging',
                    'Look down to keep neck neutral',
                    'Squeeze glute of extended leg',
                    'Move deliberately, not quickly'
                ]
            },
            category: 'Core'
        },
        {
            id: 'plank',
            name: '12. Plank',
            targetReps: '20-40 sec',
            leftTarget: 20,
            rightTarget: 20,
            sets: 3,
            bilateral: true,
            instructions: {
                title: 'Plank (Modified → Full)',
                steps: [
                    'Start on forearms, elbows under shoulders',
                    'Week 1-4: Knees down (modified)',
                    'Week 5+: Full plank from toes if comfortable',
                    'Body in straight line from head to heels',
                    'Hold position, breathe normally',
                    'Stop if hips sag or back hurts'
                ],
                reps: '20-40 seconds',
                sets: '3 sets',
                why: 'Total core engagement, full anterior chain activation',
                tips: [
                    'Don\'t let hips sag down',
                    'Don\'t pike hips up',
                    'Squeeze glutes',
                    'Push floor away with forearms',
                    'If back hurts, return to knees-down version'
                ]
            },
            category: 'Core'
        },
        {
            id: 'ankle_mobility',
            name: '13. Ankle Mobility',
            targetReps: '15 each side',
            leftTarget: 15,
            rightTarget: 22,
            sets: 1,
            instructions: {
                title: 'Ankle Mobility (Dorsiflexion)',
                steps: [
                    'Face wall, stand about 6 inches away',
                    'Place one foot forward',
                    'Push knee toward wall',
                    'Keep heel DOWN on floor',
                    'Feel stretch in calf and ankle',
                    'Hold 2 seconds, return',
                    'Repeat 15 times'
                ],
                reps: '15 each side',
                sets: '3 sets',
                why: 'Limited ankle mobility causes compensations throughout chain - KEY for preventing injury',
                tips: [
                    'Heel MUST stay down',
                    'If heel lifts, move closer to wall',
                    'Aim to touch wall with knee',
                    'Do daily, especially before exercise',
                    'Progress = moving further from wall'
                ]
            },
            category: 'Mobility'
        },
        {
            id: 'hip_flexor_stretch',
            name: '14. Hip Flexor Stretch',
            targetReps: '30 sec hold',
            leftTarget: 30,
            rightTarget: 30,
            sets: 3,
            instructions: {
                title: 'Hip Flexor Stretch',
                steps: [
                    'Kneeling lunge position',
                    'Back knee on ground (use pad)',
                    'Front knee at 90°',
                    'Push hips forward',
                    'Keep torso upright',
                    'Feel stretch in front of back hip',
                    'Hold 30 seconds'
                ],
                reps: '30 seconds each side',
                sets: '3 sets',
                why: 'Tight hip flexors affect posture, gait, and can cause back pain',
                tips: [
                    'Don\'t lean forward',
                    'Squeeze glute of back leg',
                    'Gentle stretch, not painful',
                    'Breathe deeply',
                    'Hold consistent tension'
                ]
            },
            category: 'Mobility'
        },
        {
            id: 'piriformis_stretch',
            name: '15. Piriformis Stretch',
            targetReps: '30 sec hold',
            leftTarget: 30,
            rightTarget: 30,
            sets: 3,
            instructions: {
                title: 'Piriformis Stretch (Figure-4)',
                steps: [
                    'Lie on back',
                    'Cross right ankle over left knee (figure-4)',
                    'Thread hands behind left thigh',
                    'Pull left knee toward chest',
                    'Feel stretch in right glute',
                    'Hold 30 seconds',
                    'Switch sides'
                ],
                reps: '30 seconds each side',
                sets: '3 sets',
                why: 'Relieves pressure on sciatic nerve, releases deep hip rotators',
                tips: [
                    'Keep crossed ankle flexed',
                    'Pull toward chest, not to side',
                    'Relax into stretch',
                    'Should feel deep in glute',
                    'Critical for sciatic relief'
                ]
            },
            category: 'Mobility'
        }
    ],
    
    phase2: [
        // Continue Phase 1 exercises, plus add these:
        {
            id: 'step_ups',
            name: '16. Step-Ups',
            targetReps: '12 each (18 right)',
            leftTarget: 12,
            rightTarget: 18,
            sets: 3,
            category: 'Single-Leg Strength'
        },
        {
            id: 'split_squats',
            name: '17. Split Squats (Bulgarian)',
            targetReps: '10 each (15 right)',
            leftTarget: 10,
            rightTarget: 15,
            sets: 3,
            category: 'Single-Leg Strength'
        },
        {
            id: 'single_leg_deadlift',
            name: '18. Single-Leg Deadlift',
            targetReps: '10 each (15 right)',
            leftTarget: 10,
            rightTarget: 15,
            sets: 3,
            category: 'Single-Leg Strength'
        },
        {
            id: 'lateral_band_walks',
            name: '19. Lateral Band Walks',
            targetReps: '15 steps each way',
            leftTarget: 15,
            rightTarget: 22,
            sets: 3,
            category: 'Dynamic Stability'
        },
        {
            id: 'balance_reaches',
            name: '20. Single-Leg Balance Reaches',
            targetReps: '8 each direction',
            leftTarget: 8,
            rightTarget: 12,
            sets: 2,
            category: 'Dynamic Stability'
        },
        {
            id: 'goblet_squats',
            name: '21. Goblet Squats',
            targetReps: '12-15',
            leftTarget: 12,
            rightTarget: 12,
            sets: 3,
            category: 'Controlled Loading'
        }
    ],
    
    phase3: [
        // Continue Phase 2 exercises, plus add these:
        {
            id: 'box_step_ups',
            name: '22. Box Step-Ups with Knee Drive',
            targetReps: '10 each (15 right)',
            leftTarget: 10,
            rightTarget: 15,
            sets: 3,
            category: 'Power & Plyometrics'
        },
        {
            id: 'single_leg_hops',
            name: '23. Single-Leg Hops',
            targetReps: '5-8 per direction',
            leftTarget: 5,
            rightTarget: 8,
            sets: 3,
            category: 'Power & Plyometrics'
        },
        {
            id: 'farmers_carries',
            name: '24. Farmer\'s Carries',
            targetReps: '20m each side',
            leftTarget: 20,
            rightTarget: 20,
            sets: 3,
            category: 'Power & Plyometrics'
        }
    ]
};

// Get exercises for a specific phase
function getExercisesForPhase(phase) {
    switch(phase) {
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

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { exercises, getExercisesForPhase };
}
