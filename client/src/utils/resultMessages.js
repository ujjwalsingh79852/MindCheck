// Message pools for the dynamic "Your Result" section.
// Tone: Supportive, non-diagnostic, non-prescriptive ("might help", "could try"), avoiding generic motivational cliches.

const MESSAGE_POOLS = {
  // 1. High Stress (7-10) & Low Resilience (<50)
  highStress_lowResilience: [
    {
      text: "Today seems to be carrying a heavy load, and it's completely understandable to feel drained when demands outweigh your recovery time. Giving yourself permission to pause for a few moments might help restore a bit of space.",
      actionType: "breathing"
    },
    {
      text: "Navigating a high-stress day with limited energy can feel exhausting. Acknowledging how hard you're working right now is an important first step—taking things one small moment at a time could offer some relief.",
      actionType: "breathing"
    },
    {
      text: "It looks like academic and personal pressures are taking a significant toll today. Stepping back briefly to focus on simple rest or grounding exercises might help ease the strain.",
      actionType: "breathing"
    },
    {
      text: "When stress is high and energy reserves feel low, even routine tasks can feel daunting. Pausing to take a gentle breath might help bring a moment of calm into your day.",
      actionType: "breathing"
    }
  ],

  // Repeated pattern variant for High Stress & Low Resilience (3+ times in last 5 check-ins)
  highStress_lowResilience_repeating: [
    {
      text: "Noticeable stress has been building over several recent check-ins while your recovery buffer remains thin. When pressure persists like this, sharing the weight with a campus counselor or supportive peer might help lighten the load.",
      actionType: "counselor"
    },
    {
      text: "Your recent check-ins suggest a continued period of elevated pressure without much room for rest. Connecting with student wellness services could provide fresh strategies for managing this ongoing stretch.",
      actionType: "counselor"
    },
    {
      text: "Navigating persistent high stress over multiple days can be wearing. Reaching out for a confidential conversation with a counselor might give you a safe space to unpack these demands.",
      actionType: "counselor"
    }
  ],

  // 2. High Stress (7-10) & High Resilience (>=50)
  highStress_highResilience: [
    {
      text: "You're facing a demanding workload today, but your solid sleep and coping habits are providing a strong buffer. Breaking larger assignments into smaller steps might make tackling them feel even more manageable.",
      actionType: "tasks"
    },
    {
      text: "Academic expectations are high right now, yet your resilience indicators show you're drawing on good recovery practices. Pacing your tasks steadily could help maintain this momentum without pushing into fatigue.",
      actionType: "tasks"
    },
    {
      text: "While today's stress level is elevated, your recovery habits are holding steady. Focusing on just one priority at a time might help you navigate through the busiest parts of your schedule.",
      actionType: "tasks"
    },
    {
      text: "There is significant pressure on your calendar, but your self-care foundation is supporting you well. Simplifying your task list for today could help preserve your energy.",
      actionType: "tasks"
    }
  ],

  // 3. Medium Stress (4-6)
  mediumStress: [
    {
      text: "Your stress level is sitting in a moderate, typical range today. Balancing your study blocks with short relaxation breaks might help keep things steady as you work through your tasks.",
      actionType: "resources"
    },
    {
      text: "Things feel fairly manageable today, though there's enough activity to keep you on your toes. Taking a few minutes to stretch or review self-help guides could be a pleasant reset.",
      actionType: "resources"
    },
    {
      text: "You're experiencing a middle-of-the-road level of pressure today. Maintaining a flexible mindset and allowing room for quiet pauses might help keep stress from building up further.",
      actionType: "resources"
    },
    {
      text: "Today presents a mix of routine demands and steady energy. Checking out a brief guided breathing or relaxation exercise might add a nice boost of clarity to your afternoon.",
      actionType: "resources"
    }
  ],

  // 4. Low Stress (1-3)
  lowStress: [
    {
      text: "Your stress levels are low and your mind appears to be in a calm, balanced state today. Enjoying this sense of ease can be a wonderful way to recharge for upcoming projects.",
      actionType: "none"
    },
    {
      text: "It looks like today is offering a pleasant, lighter atmosphere. Celebrating these peaceful days helps build long-term well-being and perspective.",
      actionType: "none"
    },
    {
      text: "You're experiencing a gentle, low-pressure day. Taking a moment to appreciate your steady pace can help reinforce positive habits.",
      actionType: "none"
    },
    {
      text: "A quiet, low-stress day is a great opportunity to focus on creative pursuits, personal wellness, or simply resting without expectation.",
      actionType: "none"
    }
  ]
};

/**
 * Rule-based evaluation function to determine dynamic feedback.
 * 
 * @param {Object} params
 * @param {number} params.stress - Overall stress slider value (1-10)
 * @param {number} params.resilienceIndex - Resilience Score (0-100)
 * @param {Array} params.history - Student's check-in history array
 * @param {boolean} params.hasPendingTasks - Whether student has pending tasks today
 * @returns {Object} { category, text, actionType, actionLabel }
 */
export function getResultFeedback({ stress = 5, resilienceIndex = 50, history = [], hasPendingTasks = false }) {
  const stressNum = Number(stress);
  const resilienceNum = Number(resilienceIndex);

  // Check repeating high-stress / low-resilience pattern in last 5 check-ins
  const last5 = (history || []).slice(0, 5);
  const repeatHighStressCount = last5.filter(c => Number(c.stress) >= 7 && (c.resilienceIndex === undefined || Number(c.resilienceIndex) < 50)).length;
  const isRepeatingPattern = repeatHighStressCount >= 3;

  let poolKey = 'mediumStress';
  let categoryLabel = 'Balanced Workload & Stress';
  let badgeColor = '#3b82f6';
  let cardBg = '#f0f9ff';
  let cardBorder = '#bae6fd';

  if (stressNum >= 7) {
    if (resilienceNum < 50) {
      poolKey = isRepeatingPattern ? 'highStress_lowResilience_repeating' : 'highStress_lowResilience';
      categoryLabel = 'High Pressure • Low Energy Buffer';
      badgeColor = '#ef4444';
      cardBg = '#fef2f2';
      cardBorder = '#fecaca';
    } else {
      poolKey = 'highStress_highResilience';
      categoryLabel = 'High Demand • Solid Coping Buffer';
      badgeColor = '#f59e0b';
      cardBg = '#fffbeb';
      cardBorder = '#fde68a';
    }
  } else if (stressNum <= 3) {
    poolKey = 'lowStress';
    categoryLabel = 'Calm & Restful Baseline';
    badgeColor = '#10b981';
    cardBg = '#f0fdf4';
    cardBorder = '#a7f3d0';
  }

  const pool = MESSAGE_POOLS[poolKey] || MESSAGE_POOLS.mediumStress;
  // Pick variant deterministically based on history length or date to avoid daily repetition
  const variantIndex = (history.length || Date.now()) % pool.length;
  const selectedVariant = pool[variantIndex];

  let actionLabel = null;
  let finalActionType = selectedVariant.actionType;

  if (finalActionType === 'breathing') {
    actionLabel = 'Try 4-7-8 Breathing Guide';
  } else if (finalActionType === 'counselor') {
    actionLabel = 'Talk to Campus Counselor';
  } else if (finalActionType === 'tasks') {
    actionLabel = hasPendingTasks ? 'Break Down Today\'s Tasks' : 'Open Task Planner';
  } else if (finalActionType === 'resources') {
    actionLabel = 'Explore Self-Help Resources';
  }

  return {
    categoryKey: poolKey,
    categoryLabel,
    text: selectedVariant.text,
    actionType: finalActionType,
    actionLabel,
    badgeColor,
    cardBg,
    cardBorder
  };
}
