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
            category: 'Foot & Ankle'
        },
        {
            id: 'toe_yoga',
            name: '2. Toe Yoga',
            targetReps: '10 each direction',
            leftTarget: 10,
            rightTarget: 15,
            sets: 2,
            category: 'Foot & Ankle'
        },
        {
            id: 'towel_scrunch',
            name: '3. Towel Scrunches',
            targetReps: '20 each foot',
            leftTarget: 20,
            rightTarget: 30,
            sets: 2,
            category: 'Foot & Ankle'
        },
        {
            id: 'single_leg_balance',
            name: '4. Single-Leg Balance',
            targetReps: '30-60 sec each',
            leftTarget: 30,
            rightTarget: 45,
            sets: 3,
            category: 'Balance'
        },
        {
            id: 'calf_raises',
            name: '5. Calf Raises',
            targetReps: '15-20',
            leftTarget: 15,
            rightTarget: 22,
            sets: 3,
            category: 'Foot & Ankle'
        },
        {
            id: 'clamshells',
            name: '6. Clamshells',
            targetReps: '20 each (30 right)',
            leftTarget: 20,
            rightTarget: 30,
            sets: 3,
            category: 'Hip & Glute'
        },
        {
            id: 'hip_abduction',
            name: '7. Side-Lying Hip Abduction',
            targetReps: '15 each (22 right)',
            leftTarget: 15,
            rightTarget: 22,
            sets: 3,
            category: 'Hip & Glute'
        },
        {
            id: 'glute_bridges',
            name: '8. Glute Bridges (Both Legs)',
            targetReps: '20',
            leftTarget: 20,
            rightTarget: 20,
            sets: 3,
            category: 'Hip & Glute'
        },
        {
            id: 'single_leg_bridge',
            name: '9. Single-Leg Glute Bridge',
            targetReps: '12 each (18 right)',
            leftTarget: 12,
            rightTarget: 18,
            sets: 3,
            category: 'Hip & Glute'
        },
        {
            id: 'dead_bug',
            name: '10. Dead Bug',
            targetReps: '12 each side',
            leftTarget: 12,
            rightTarget: 12,
            sets: 3,
            category: 'Core'
        },
        {
            id: 'bird_dog',
            name: '11. Bird Dog',
            targetReps: '10 each (15 right)',
            leftTarget: 10,
            rightTarget: 15,
            sets: 3,
            category: 'Core'
        },
        {
            id: 'plank',
            name: '12. Plank',
            targetReps: '20-40 sec',
            leftTarget: 20,
            rightTarget: 20,
            sets: 3,
            category: 'Core'
        },
        {
            id: 'ankle_mobility',
            name: '13. Ankle Mobility',
            targetReps: '15 each side',
            leftTarget: 15,
            rightTarget: 22,
            sets: 1,
            category: 'Mobility'
        },
        {
            id: 'hip_flexor_stretch',
            name: '14. Hip Flexor Stretch',
            targetReps: '30 sec hold',
            leftTarget: 30,
            rightTarget: 30,
            sets: 3,
            category: 'Mobility'
        },
        {
            id: 'piriformis_stretch',
            name: '15. Piriformis Stretch',
            targetReps: '30 sec hold',
            leftTarget: 30,
            rightTarget: 30,
            sets: 3,
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
