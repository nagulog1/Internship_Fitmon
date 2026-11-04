const { updateUserProfile } = require('../services/userService');

const NAME_MAX_LENGTH = 60;
const GOAL_MAX_LENGTH = 80;
const ARM_OPTIONS = ['auto', 'left', 'right'];

// Checks the editable fields that were sent. Fields left out are not touched.
function validateProfileUpdate(body) {
  const { name, goal, trackedArm } = body || {};
  const updates = {};
  const errors = {};

  if (name !== undefined) {
    const value = typeof name === 'string' ? name.trim() : '';
    if (!value) errors.name = 'Add a name.';
    else if (value.length > NAME_MAX_LENGTH) errors.name = `Keep your name to ${NAME_MAX_LENGTH} characters.`;
    else updates.name = value;
  }

  if (goal !== undefined) {
    const value = typeof goal === 'string' ? goal.trim() : null;
    if (value === null) errors.goal = 'The goal must be text.';
    else if (value.length > GOAL_MAX_LENGTH) errors.goal = `Keep your goal to ${GOAL_MAX_LENGTH} characters.`;
    else updates.goal = value;
  }

  if (trackedArm !== undefined) {
    if (!ARM_OPTIONS.includes(trackedArm)) errors.trackedArm = 'Choose auto, left or right.';
    else updates['preferences.trackedArm'] = trackedArm;
  }

  return { updates, errors };
}

async function updateProfile(req, res) {
  const { updates, errors } = validateProfileUpdate(req.body);

  if (Object.keys(errors).length) {
    return res.status(400).json({ message: 'Some fields need fixing.', errors });
  }

  if (!Object.keys(updates).length) {
    return res.status(400).json({ message: 'Send at least one of name, goal or trackedArm.' });
  }

  try {
    const user = await updateUserProfile(req.user.uid, updates);
    return res.json({ user });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to save profile',
      details: error.message,
    });
  }
}

module.exports = { updateProfile, validateProfileUpdate };
