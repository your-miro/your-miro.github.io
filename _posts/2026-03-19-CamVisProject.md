---
title: "Tennis Ball Deflection System: Detection, Tracking, and Deflection"
date: 2026-01-20 10:00:00 +0000
categories: [Electrical Engineering, Robotics]
tags: [Camera Vision, raspberry-pi, kalman-filter, python, opencv, Robotics, RADAR]
description: >-
  Overview of RF system design fundamentals including power amplifier
  linearization, digital predistortion (DPD), PCB design considerations,
  and system benchmarking techniques used in modern radar and wireless
  communication hardware.
---

## Overview

A real-time computer vision system that detects a tennis ball rolling toward a panel, estimates its trajectory and speed using a Kalman filter, and steers a deflector to redirect it toward a target goal. Built to run on a Raspberry Pi within a ~30ms latency budget. 

> Note: Couldn't finish this because of the war :/ (university switched to online mode)

## How It Works

**Detection** — Tennis balls are identified by HSV color masking in OpenCV. The fluorescent yellow-green of a tennis ball is distinctive enough that a simple color threshold + contour fit outperforms any ML-based detector at this latency target.

**State Estimation** — A Kalman filter tracks a 6D state vector `[px, py, vx, vy, ax, ay]` using a constant-acceleration motion model. Each frame it predicts the ball's next position from physics, then corrects the estimate with the measured pixel coordinates. During occlusion it keeps predicting without a measurement update.

**Trajectory Extrapolation** — The filter's velocity and acceleration estimates are rolled forward ~80 frames to project the ball's path. Where that path intersects the panel boundary, a target coordinate is output to the servo controller.

**Deflector Control** — The predicted wall-crossing X coordinate is mapped to a PWM duty cycle on GPIO pin 18, with a dead-band filter to suppress jitter on noisy frames.

## Tech Stack

| Concern | Tool |
|---|---|
| Video capture | `Picamera2` / `cv2.VideoCapture` (V4L2, 1-frame buffer) |
| Image processing | OpenCV — HSV mask, contour fit, optical flow |
| State estimation | Hand-rolled NumPy Kalman filter |
| Output | `RPi.GPIO` PWM on BCM 18 |
| Resolution | 320×240 (native capture, no resize cost) |

`filterpy` was dropped in favour of four bare NumPy functions to eliminate Python object overhead in the hot loop.

## Performance

Approximate per-frame budget on Raspberry Pi:

```
Capture + resize     ~3 ms
HSV mask + contour   ~5 ms
Kalman predict/update ~0.5 ms
Trajectory + GPIO    ~1.5 ms
─────────────────────────────
Total                ~10 ms  (comfortably within 30 ms target)
```

## Spin Estimation (Optional)

For cameras at ≥60 fps, a 7th state dimension `ω` can be added for ball spin. Lucas-Kanade optical flow is sampled over feature points inside the ball's circular mask; the tangential component of each flow vector gives an angular velocity estimate. A Magnus-effect acceleration term is then added to the motion model for more accurate deflection on topspin/backspin shots. Disabled by default on the Pi due to compute cost.

## Usage

```bash
# USB webcam, headless
python rpi_tennis_tracker.py --no-gpio

# Pi Camera Module + servo
python rpi_tennis_tracker.py --picam

# Tune with live preview
python rpi_tennis_tracker.py --picam --preview --verbose

# Test against a video file
python rpi_tennis_tracker.py --video test.mp4 --preview --no-gpio
```

## Key Tuning Parameters

| Parameter | Effect |
|---|---|
| `Q_STD` | Higher → filter trusts camera more (snappier, noisier) |
| `R_STD` | Higher → filter trusts physics model more (smoother, more lag) |
| `HSV_LOWER/UPPER` | Adjust for your lighting conditions (press `d` to see the mask) |
| `MIN_RADIUS / MAX_RADIUS` | Set based on camera distance to the floor |