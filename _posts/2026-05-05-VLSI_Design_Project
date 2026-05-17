---
title: "VLSI Full Adder Design, Simulation, & Layout"
date: 2025-01-20 10:00:00 +0000
categories: [Electrical Engineering, Radar Design]
tags: [vlsi, cmos, ltspice, electric-vlsi, digital-design]
description: >-
  Overview of RF system design fundamentals including power amplifier
  linearization, digital predistortion (DPD), PCB design considerations,
  and system benchmarking techniques used in modern radar and wireless
  communication hardware.
---

## Overview
 
A full 1-bit CMOS full adder designed, simulated, and laid out from the gate level up, targeting a 22nm low-power process node. The project covers transistor sizing, propagation delay extraction via SPICE directives, physical layout in Electric VLSI, and a comparison between schematic-level and layout-extracted parasitics.
 
> **figure:** Top-level schematic from `Full_Adder.asc` showing the NAND/INV gate tree for Sum and Cout.
 
---
 
## Part 1: Schematic
 
### Transistor Sizing
 
The design uses a NAND-based implementation with the following sizing ratios chosen to balance rise/fall resistances:
 
| Gate | P:N ratio |
|---|---|
| INV | 2:1 |
| NAND2 | 2:2 |
| NAND3 | 2:3 |
 
No aggressive sizing optimization was performed beyond matching pull-up and pull-down drive strengths.
 
### Propagation Delay Measurement
 
Delays were extracted using LTspice's `.meas TRAN` directive, which interpolates crossing times at the 50% switching threshold (V = 0.475V) directly from the solver — more accurate than the cursor method.
 
```spice
.meas TRAN tpdf_gate TRIG V(in) VAL=0.475 RISE=1
+           TARG V(out) VAL=0.475 FALL=1
```
 
**Individual gate results:**
 
| Gate | t_pdf | t_pdr |
|---|---|---|
| INV | 1.807 ns | 1.514 ns |
| NAND2 | 1.871 ns | 1.516 ns |
| NAND3 | 1.950 ns | 1.520 ns |
 
> **Suggested figure:** LTspice waveforms for NAND2 and NAND3 showing the 50% crossing points used for delay extraction.
 
### Full Adder Top-Level Delay
 
A 320ns transient simulation cycling all 8 input combinations verified correct Sum and Cout logic. Worst-case paths (measured from input C):
 
**Sum output:**
 
| Transition | Delay |
|---|---|
| Rising (011 → 100) | 12.88 ns |
| Falling (100 → 101) | 12.84 ns |
 
**Cout output:**
 
| Transition | Delay |
|---|---|
| Rising (010 → 011) | 4.41 ns |
| Falling (111 → 000) | 3.39 ns |
 
The Sum path is ~3× slower than Cout, as expected — it passes through more gate stages. These values align with hand-calculated worst-case paths from the individual gate delays above.
 
> **figure:** The annotated truth table waveform from `Circuit.asc` showing all 8 input combinations with Sum and Cout outputs.
 
---
 
## Part 2: Layout
 
### Electric VLSI Cell Layout
 
The full adder was laid out in Electric VLSI using standard cell conventions: PMOS devices in the upper rail (VDD), NMOS in the lower rail (GND), with inputs A, B, C brought in from the bottom and the output taken from the center. DRC passed with **0 errors and 0 warnings**.
 
> **figure:** Electric VLSI layout screenshot of the NOR3 cell with the PMOS/NMOS rows and metal routing visible.
 
The extracted netlist (NOR3 cell shown as representative example) reflects the actual diffusion geometry:
 
```spice
Mnmos@0 OUT A gnd gnd nmos L=0.4U W=0.8U
Mpmos@0 net@0 A vdd vdd pmos L=0.4U W=4.8U
```
 
The 6:1 PMOS-to-NMOS width ratio in the layout (W = 4.8µm vs 0.8µm) reflects the mobility difference between holes and electrons at this node.
 
### Schematic vs. Layout Timing Comparison
 
The key result of the layout phase is the impact of parasitic capacitances extracted from the physical geometry:
 
| NOR3 | Electric (layout) | LTspice (schematic) |
|---|---|---|
| T_pdr | 3.848 ns | 1.847 ns |
| T_pdf | 3.754 ns | 2.066 ns |
 
The layout delays are roughly **2× higher** than the schematic estimates. LTspice captures only the ideal RC ladder from transistor sizing; Electric additionally captures wire capacitances, diffusion overlaps, and well proximity effects from the actual drawn geometry. This gap illustrates why parasitic extraction and iterative layout refinement are essential steps in any real VLSI design flow.
 
> **Suggested figure:** Side-by-side LTspice waveforms for NOR3 Tpdr and Tpdf, annotated with the two measured delay values.
 
---
 
## Potential Directions
 
**Multi-bit adder:** Chain several 1-bit cells into a 4- or 8-bit ripple carry adder and measure how carry propagation delay scales. Compare against a carry-lookahead implementation using the same gate primitives.
 
**Logical effort optimization:** Apply the logical effort method systematically to re-size transistors along the critical Sum path and quantify the delay reduction against the baseline sizing used here.
 
**Power analysis:** Add `.meas` directives to capture average supply current and compute dynamic power at different switching frequencies. This is a natural extension given the transient simulation infrastructure already in place.
 