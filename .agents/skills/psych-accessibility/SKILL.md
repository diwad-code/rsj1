---
name: psych-accessibility
description: "Accessibility and inclusivity validation for game development. Invoked by game-psychologist agent at validation checkpoints. Applies UDL, WCAG, Sensory Processing Theory, neurodiversity considerations, and cultural sensitivity to validate inclusive design."
---

# Accessibility & Inclusivity

Validates that game design is accessible to all players regardless
of ability, neurodiversity, or cultural background.

## Frameworks

### Universal Design for Learning (UDL)
Multiple means of:
- **Engagement** — Multiple ways to stay motivated
- **Representation** — Multiple ways to present information
- **Action/Expression** — Multiple ways to respond/interact

### WCAG Principles
- **Perceivable** — Information can be perceived (seen, heard)
- **Operable** — Interface can be operated (keyboard, touch, mouse)
- **Understandable** — Content and UI are understandable
- **Robust** — Works across different devices and assistive tech

### Sensory Processing Theory
Provide controls for:
- Animation intensity (reduce motion option)
- Sound volume (mute, volume slider)
- Visual complexity (simplified mode)
- Flashing/strobing (never exceed 3 flashes/second)

### Neurodiversity Considerations

**ADHD:**
- Short task segments (2-3 minutes max per task)
- Clear progress indicators
- Minimize distractions (clean UI, no autoplay distractions)
- Immediate feedback on actions

**Dyslexia:**
- Sans-serif fonts (Nunito, Inter, system-ui)
- Adequate letter and line spacing
- Audio alternatives for text-heavy content
- Icon-based navigation where possible

**Autism:**
- Predictable patterns and routines
- Clear transitions between activities (no sudden changes)
- No surprise interruptions or pop-ups
- Consistent layout and navigation

**Motor:**
- Large tap targets (≥ 48px × 48px)
- Generous timing (no rapid precision requirements)
- Keyboard navigation support
- No drag-and-drop without alternatives

### Cultural Sensitivity
- Respectful representation of all cultures
- Avoid stereotypes in characters and scenarios
- Consider localization (text direction, number formats)
- Diverse representation in characters and examples

### Color Accessibility
- Sufficient contrast (WCAG AA: 4.5:1 for text, 3:1 for large text)
- Don't rely on color alone for meaning (add icons/patterns)
- Test with color blindness simulators
- Provide high contrast mode option

## Validation Checklist

- [ ] Tap targets ≥ 48px × 48px
- [ ] Color contrast meets WCAG AA
- [ ] Predictable navigation patterns
- [ ] Sensory controls available (motion, sound, visual complexity)
- [ ] Content is culturally respectful
- [ ] Keyboard navigation works for all interactions
- [ ] No reliance on color alone for meaning
- [ ] Sans-serif fonts with adequate spacing
- [ ] No flashing exceeding 3 per second
- [ ] Multiple means of engagement, representation, and expression (UDL)
