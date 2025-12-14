# Quickstart: App Loading Screen with Lottie Animation

**Feature**: App Loading Screen with Lottie Animation  
**Date**: 2025-12-14  
**Phase**: Phase 1 - Design & Contracts

## Test Scenarios

### Scenario 1: Initial Page Load

**Given**: User navigates to the portfolio URL  
**When**: The page begins loading  
**Then**: 
- Loading screen appears immediately (within 100ms)
- Lottie animation plays continuously
- Loading screen covers entire viewport including navigation
- Screen reader announces "Loading application"

**Test Steps**:
1. Open browser DevTools
2. Navigate to `http://localhost:3000` (or production URL)
3. Observe loading screen appears immediately
4. Verify animation is playing
5. Verify full-screen coverage (check z-index and positioning)

**Expected Result**: Loading screen visible with animation playing

---

### Scenario 2: Fast Load with Minimum Display Time

**Given**: User has fast internet connection  
**When**: Page loads in under 1 second  
**Then**: 
- Loading screen still displays for minimum duration (1.5s default)
- Animation continues playing during minimum display time
- Loading screen fades out smoothly after minimum time

**Test Steps**:
1. Open browser DevTools → Network tab
2. Set throttling to "Fast 3G" or disable throttling
3. Navigate to portfolio URL
4. Measure time from page load to loading screen dismissal
5. Verify minimum display time is respected

**Expected Result**: Loading screen displays for at least 1.5 seconds, even if page loads faster

---

### Scenario 3: Slow Load

**Given**: User has slow internet connection  
**When**: Page takes longer than minimum display time to load  
**Then**: 
- Loading screen displays during entire load
- Animation continues playing
- Loading screen dismisses immediately after page load completes
- No unnecessary delay after load

**Test Steps**:
1. Open browser DevTools → Network tab
2. Set throttling to "Slow 3G"
3. Navigate to portfolio URL
4. Observe loading screen during load
5. Verify dismissal happens immediately after load completes

**Expected Result**: Loading screen dismisses as soon as page loads (no artificial delay)

---

### Scenario 4: Fade-Out Animation

**Given**: Loading screen is displayed  
**When**: Dismissal is triggered  
**Then**: 
- Loading screen fades out smoothly (300ms transition)
- Animation stops gracefully
- Component unmounts from DOM after fade-out
- No layout shift occurs

**Test Steps**:
1. Navigate to portfolio URL
2. Wait for loading screen to dismiss
3. Observe fade-out animation
4. Check DevTools → Elements to verify component is removed from DOM
5. Verify no layout shift (check CLS in Performance tab)

**Expected Result**: Smooth 300ms fade-out, component removed from DOM

---

### Scenario 5: Accessibility - Screen Reader

**Given**: User has screen reader enabled  
**When**: Loading screen appears  
**Then**: 
- Screen reader announces "Loading application"
- Status is announced appropriately
- No errors in accessibility tree

**Test Steps**:
1. Enable screen reader (NVDA, JAWS, or VoiceOver)
2. Navigate to portfolio URL
3. Listen for "Loading application" announcement
4. Check accessibility tree in DevTools

**Expected Result**: Screen reader correctly announces loading state

---

### Scenario 6: Performance - 60fps Animation

**Given**: Loading screen is displayed  
**When**: Animation is playing  
**Then**: 
- Animation plays at 60fps
- No frame drops or jank
- No performance warnings in console

**Test Steps**:
1. Open DevTools → Performance tab
2. Start recording
3. Navigate to portfolio URL
4. Stop recording after loading screen dismisses
5. Check FPS metrics
6. Verify no frame drops below 60fps

**Expected Result**: Consistent 60fps animation playback

---

### Scenario 7: SPA Navigation (No Loading Screen)

**Given**: User is already on the portfolio site  
**When**: User navigates to a different page within the SPA  
**Then**: 
- Loading screen does NOT appear
- Only initial page load shows loading screen
- Navigation is instant (no loading overlay)

**Test Steps**:
1. Navigate to portfolio URL (loading screen appears)
2. Wait for loading screen to dismiss
3. Click navigation link to different page
4. Verify no loading screen appears

**Expected Result**: Loading screen only appears on initial load, not on SPA navigation

---

### Scenario 8: Custom Minimum Display Time

**Given**: Component is configured with custom `minimumDisplayTime`  
**When**: Page loads  
**Then**: 
- Loading screen respects custom minimum time
- Default (1500ms) is used if not specified

**Test Steps**:
1. Modify component usage: `<AppLoadingScreen minimumDisplayTime={3000} />`
2. Navigate to portfolio URL
3. Measure time from load to dismissal
4. Verify custom time is respected

**Expected Result**: Custom minimum display time is honored

---

### Scenario 9: Error Handling - Missing Animation File

**Given**: Lottie animation file is missing or fails to load  
**When**: Loading screen attempts to display animation  
**Then**: 
- Component handles error gracefully
- Loading screen still displays (even without animation)
- No console errors break the application
- User experience is not broken

**Test Steps**:
1. Temporarily rename or remove `public/Skull_and_Bone_Turnaround.lottie`
2. Navigate to portfolio URL
3. Check console for errors
4. Verify loading screen still functions (even if animation doesn't play)

**Expected Result**: Graceful degradation, no application crash

---

### Scenario 10: Memory Leak Prevention

**Given**: Loading screen has been dismissed  
**When**: Component unmounts  
**Then**: 
- Component is completely removed from DOM
- Event listeners are cleaned up
- No memory leaks detected
- React DevTools shows no lingering components

**Test Steps**:
1. Navigate to portfolio URL
2. Wait for loading screen to dismiss
3. Check React DevTools → Components
4. Verify `AppLoadingScreen` is not in component tree
5. Check DevTools → Memory for leaks

**Expected Result**: Component fully unmounted, no memory leaks

---

## Manual Testing Checklist

- [ ] Loading screen appears on initial page load
- [ ] Animation plays smoothly at 60fps
- [ ] Minimum display time is respected (1.5s default)
- [ ] Fade-out animation is smooth (300ms)
- [ ] Component unmounts after dismissal
- [ ] No layout shift occurs
- [ ] Screen reader announces loading state
- [ ] Loading screen only appears on initial load (not SPA navigation)
- [ ] Custom `minimumDisplayTime` prop works
- [ ] Error handling for missing animation file

## Automated Testing

### Unit Tests
Location: `src/components/layout/__tests__/app-loading-screen.test.tsx`

Run: `npm test app-loading-screen`

### E2E Tests
Location: `e2e/` (to be created)

Run: `npm run test:e2e`

---

## Performance Benchmarks

- **Appearance Time**: < 100ms from navigation
- **Animation FPS**: 60fps (no drops)
- **Fade-out Duration**: 300ms (exact)
- **Memory**: No leaks after unmount
- **Layout Shift (CLS)**: 0 (no shift)

---

## Browser Testing Matrix

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

