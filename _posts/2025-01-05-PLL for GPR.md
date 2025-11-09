---
title: "PLL for Ground Penetrating Radar"
math: true
date: 2025-01-20 10:00:00 +0000
categories: [Electrical Engineering, Radar Design]
tags: [RF design, PCB Design, Radar, system benchmarking, wireless systems]
description: >-
  
image:
  path: assets/img/PLL for GPR/PLL.png
  alt: Figure of PLL
---

## Under construction

## System Objectives
 Build & Test Prototype for a Ground-Penetrating Radar (GPR) using the AD4159 Frequency Synthesizer via FMCW radar rather than pulsed radar operation (as is done commercially and in most of literature). This endeavor may be difficult for two reasons: 

 - The first being that the frequencies most viable in GPR are relatively low.
 - To have a larger range resolution, a bigger bandwidth of the frequency sweep is required. 
 
 Whilst the chirp generation may be easy, the issue arises in the subsequent RF blocks. Where amplifying and filtering the signal would require a relatively wide bandwidth, expressed as the ratio $f_\text{bandwidth} / f_\text{center}$. Hence, a compromise must be taken to make up for either. \[Perhaps an atypical approach should be considered, more on this project later...\]