---
title: Offline ML-DPD Research Archive
date: 2025-12-12 00:00:00 +0400
categories: [Research, RF Machine Learning]
tags: [dpd, machine-learning, rf, aclr, nmse, bilstm, rvtdnn, arvtdnn, pruning, memory-polynomial, adrv9026]
math: true
---

# Offline ML-DPD Research Archive

This archive summarizes my offline digital predistortion (DPD) work as an undergraduate research assistant in the Advanced Radio Technologies Lab. The work sits between RF measurement, classical memory-polynomial intuition, and machine-learning-based PA modeling. Most experiments used measured IQ data from the team's ADRV9026-MB evaluation-board system and supporting lab instrumentation.

The main research thread was measurement-driven ML-DPD: align measured PA input/output IQ, transform the samples into memory-aware features, train behavioral PA models, and use those models to evaluate or train neural DPD systems. Over time, the work expanded from BiLSTM behavioral modeling into spectral-loss DPD, cross-PA transfer, efficient input selection, pruning, and hybrid least-squares/neural regression.

## Spectral-Output-Aware DPD Loss

One of the clearest novelties was a loss function that used spectral output data directly. Instead of optimizing only time-domain MSE or NMSE, I reconstructed complex IQ from the model output, computed a spectrum, separated the carrier and adjacent-channel regions, and penalized adjacent-channel leakage.

Conceptually, the loss was:

```text
complex prediction -> windowed FFT -> PSD
PSD -> main-channel power + adjacent-channel power
loss = time-domain error + scheduled_weight * adjacent-channel penalty
```

This matters because RF linearization is judged spectrally. A waveform can have acceptable sample error while still producing unacceptable spectral regrowth. By adding an ACLR-oriented term, the training objective was tied more directly to the metric that matters in deployment.

The approach is related in spirit to spectrum-domain fitting methods such as the user-provided arXiv reference on optimization-based behavioral modeling for mixers. That paper is not a PA-DPD paper, but it supports the same methodological idea: emphasize the spectral products that dominate system-level distortion rather than treating all errors as equally important. Reference: [Optimization-Based Behavioral Modeling of Mixers for Frequency Comb OFDM Radar Processing](https://arxiv.org/abs/2602.23889).

Representative results from the recorded experiments showed baseline adjacent-channel leakage around `-28 dBc`, improving to roughly `-44 dBc` after linearization. A cross-PA linearization test also produced adjacent-channel values around `-44 dBc`, suggesting that the spectral objective was capturing behavior relevant beyond a single narrow training case.

> I implemented a spectrum-aware offline DPD objective that augments time-domain error with an ACLR penalty computed from predicted IQ spectra, aligning neural DPD training with adjacent-channel leakage reduction.

## Cascaded Differentiable DPD

Another core contribution was building a cascaded offline DPD workflow. The process was:

```text
measured PA input/output IQ
        -> train behavioral PA model
        -> freeze PA model
        -> insert trainable DPD model before it
        -> optimize DPD through frozen PA surrogate
```

This approach uses a learned PA model as a differentiable surrogate for hardware. The real RF chain cannot be directly backpropagated through, but a neural behavioral model can approximate it closely enough to train a predistorter offline.

This allowed me to separate two problems: first learn the PA's nonlinear and memory behavior, then optimize an inverse/predistortion function through that learned behavior. Recorded behavioral-model runs reached roughly `-31 dB` to `-33 dB` NMSE in representative PA1/PA2 experiments.

> I built an offline DPD training loop by first learning a differentiable PA surrogate, freezing it, and then optimizing a neural predistorter through that surrogate using measured RF behavior.

## BiLSTM PA Behavioral Modeling

The early ML work treated PA behavioral modeling as a sequence-learning problem. I converted IQ samples into delayed input tensors and used bidirectional LSTM layers to predict PA output IQ from input histories.

The delay-matrix idea can be summarized as:

```text
x[n] -> [x[n], x[n-1], x[n-2], ..., x[n-M]]
```

where each complex sample is represented through I/Q channels. This made the model explicitly memory-aware while letting the BiLSTM learn nonlinear temporal dependencies from measured data.

> I modeled PA memory effects using BiLSTM sequence models over delayed I/Q samples and evaluated the models using RF metrics such as NMSE, PSD, AM/AM, AM/PM, and ACLR.

## Cross-PA Transfer and Lightweight Adaptation

I also explored whether learned PA dynamics could transfer from one PA to another. Several experiments froze a larger recurrent block trained on one PA and retrained only small dense, gain, or adaptation layers for another PA.

The transfer-learning pattern was:

```text
PA1-trained recurrent dynamics -> frozen
small adaptation layer(s)      -> trainable for PA2
```

> I investigated cross-PA model reuse by freezing high-capacity recurrent dynamics learned from one PA and retraining only lightweight adaptation layers for another PA.

## Memory-Polynomial Input Matrix Selection

A major second thread was efficient training through memory-polynomial input matrix selection. I generated feature matrices that combined delayed I/Q terms with nonlinear envelope terms:

```text
num_features = 2 * memory_depth + (nonlinear_degree - 1) * memory_depth
```

With the common setting:

```text
memory_depth = 5
nonlinear_degree = 5
num_features = 30
```

The feature matrix contained delayed real/imaginary samples plus nonlinear magnitude terms. The key research question was not only whether fewer samples could be used, but which samples should be used without making the training distribution unrealistic.

The selection strategies included:

- Selecting a window around the largest-magnitude event.
- Sorting rows by nonlinear magnitude and training on high-power regions.
- Selecting a fixed high-magnitude portion and filling the rest randomly.
- Preserving nonlinear/linear ratios across train, validation, and test splits.
- Grouping adjacent rows to avoid leakage caused by memory overlap.
- Matching the envelope distribution with quantile bins.

The strongest lesson was that peak-only selection is risky. It can overrepresent the nonlinear region, shift the training PDF away from the real operating distribution, and make test NMSE less meaningful. A better selection strategy should keep enough nonlinear samples to teach compression behavior while preserving the distribution needed for fair evaluation.

A representative selected-input ARVTDNN-style run reached around `-35 dB` NMSE, showing that careful selection can preserve modeling quality while reducing the amount of training data.

> I developed and evaluated memory-polynomial input matrix selection methods for efficient neural PA modeling, comparing peak-window, magnitude-sorted, partial-random, and PDF-preserving selection strategies.

## Neural Model Pruning

In parallel with input selection, I explored model pruning for lower-complexity RVTDNN and ARVTDNN models. The pruning workflow was:

```text
pretrained model
    -> apply magnitude pruning schedule
    -> retrain with sparsity constraint
    -> strip pruning wrappers
    -> export compact model
```

This addressed a different deployment bottleneck than input selection. Input selection reduces training burden and can improve sample efficiency; pruning reduces model storage and inference cost.


> I explored low-complexity PA modeling from two directions: selecting more informative memory-polynomial input rows before training and applying neural weight pruning after training.

## Least-Squares-Constrained Neural Regression

I also worked with hybrid neural/regression models where a neural front end learns features and a least-squares layer performs the final I/Q regression. This bridges classical GMP-style modeling and neural feature learning.

The pattern is:

```text
memory-aware input features
        -> neural feature extractor
        -> least-squares regression layer
        -> predicted PA output IQ
```

This is useful because PA modeling has a long history of linear-in-parameters polynomial regression, while neural networks are better at flexible feature construction. Combining the two gives a structured alternative to a fully black-box dense regressor. A memory-polynomial baseline around `-32.5 dB` NMSE provided a useful classical reference point.

> I explored hybrid neural/regression PA models where a neural front end learns useful features and a least-squares layer performs the final I/Q regression.

## KAN Status

I researched whether memory-polynomial input matrix selection could act as a pruning or basis-selection strategy for KAN-style neural DPD. In this archive, the documented experiments mainly cover BiLSTM, RVTDNN, ARVTDNN, pruning, and memory-matrix selection rather than explicit KAN runs.

<!-- 
> I researched the applicability of memory-polynomial input matrix selection as an efficient basis-selection strategy for KAN-style neural DPD, while the documented experiments focused on BiLSTM, RVTDNN, and ARVTDNN models. -->

## Hardware and Measurement Context

The work was not simulation-only. It involved aligned measured IQ captures, PA input/output analysis, AM/AM and AM/PM plots, PSD and ACLR calculations, memory matrix generation, and repeated model comparisons. The ADRV9026-MB evaluation-board system gave the project a practical RF measurement basis and forced the modeling work to deal with real capture alignment, nonlinear compression, memory effects, and spectral regrowth.


> Most experiments used measured IQ data from an ADRV9026-MB evaluation-board system implemented by the team in the Advanced Radio Technologies Lab, grounding the ML-DPD work in practical RF measurements.

## Credit Notes

- <a href = "https://majid-0.github.io/">Majid Ahmed</a>

## Strongest Public-Facing Claims

- Developed offline ML-DPD workflows using measured IQ from an ADRV9026-MB lab evaluation-board system.
- Built BiLSTM behavioral PA models that capture memory effects and support differentiable cascaded DPD training.
- Implemented a spectral-output-aware DPD loss that directly penalizes adjacent-channel leakage.
- Evaluated linearization using ACLR, NMSE, PSD, AM/AM, and AM/PM rather than generic ML metrics alone.
- Investigated cross-PA transfer by freezing learned recurrent PA dynamics and retraining lightweight adaptation layers.
- Developed memory-polynomial input matrix selection methods for efficient PA modeling.
- Explored neural model pruning for RVTDNN/ARVTDNN deployment efficiency.
- Tested hybrid least-squares/neural regression layers as a bridge between GMP-style modeling and neural feature learning.

## Open Items

- Add explicit KAN experiment results if they are available elsewhere.
- Add the final Majid Ahmed link.
- Add before/after PSD figures and ACLR tables for a polished public post.
- Clarify which measurements came directly from the ADRV9026-MB workflow and which came from supporting measurement equipment.
