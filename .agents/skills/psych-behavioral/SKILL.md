---
name: psych-behavioral
description: "Behavioral design validation for game development. Invoked by game-psychologist agent at validation checkpoints. Applies Fogg Behavior Model, Hook Model (Nir Eyal), Nudge Theory, Habit Formation, and Session Design to validate behavioral patterns."
---

# Behavioral Design

Validates that game design creates healthy behavioral patterns
and respects player attention and wellbeing.

## Frameworks

### Fogg Behavior Model (B=MAT)
Behavior requires all three at the same moment:
- **Motivation** — Player wants to do it
- **Ability** — Player can do it (it's easy enough)
- **Trigger** — Something prompts the action (clear call to action)

### Hook Model (Nir Eyal)
Ethical application of habit formation:
- **Trigger** → **Action** → **Variable Reward** → **Investment**
- Investment makes the next trigger more engaging
- ETHICAL BOUNDARY: Hooks must serve the player's learning goals,
  not extract attention for its own sake

### Nudge Theory (Thaler & Sunstein)
Design defaults that lead to learning:
- Default paths should be educational (not skip-to-fun)
- Make the learning path the easiest path
- Don't hide educational content behind extra clicks

### Habit Formation
- **Session rituals:** Consistent start/end patterns
- **Return motivation:** Give players a reason to come back
- **Completion hooks:** End sessions at a compelling moment
- **Progress visibility:** Show how far they've come

### Session Design
Age-appropriate play durations:
- Ages 6-8: ~12-18 minutes per session
- Natural pause points every 3-5 minutes
- Clear session boundaries (start → middle → end)
- Save progress automatically

## Validation Checklist

- [ ] Next action is always clear and easy (high ability)
- [ ] Default paths are educational (nudge)
- [ ] Session length respects attention span (~12-18 min for ages 6-8)
- [ ] Return motivation exists without dark patterns
- [ ] Natural pause points every 3-5 minutes
- [ ] Progress is automatically saved
- [ ] Trigger → Action → Reward cycle serves learning goals
- [ ] No attention-extracting mechanics
