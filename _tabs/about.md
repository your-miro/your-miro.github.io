---
# the default layout is 'page'
icon: fas fa-info-circle
order: 4
---

 <span style="font-size:1.05rem">Previous Role:</span><br>
 <span style="font-size:0.95rem; color:#1d4ed8;">Undergraduate Research Assistant at the American University of Sharjah (AUS)<br>
University City, Sharjah (Aug 2024–Present)
</span>

That being said, most of the work on this website entails concepts in RF/microwave engineering and machine learning, designing and benchmarking transmitter chains while operating RF measurement rigs and connectorized components. My day-to-day spans system modeling, test automation, and telecom subsystem analysis, with a focus on spectral efficiency, signal integrity, and repeatable lab workflows.

Current research centers on power-amplifier linearization using advanced ML, including architecture-matched modeling to align nonlinearity behavior across similar PA topologies. I received an AUS Undergraduate Research Grant for this effort and continue to refine compensation strategies that improve EVM and adjacent-channel performance under realistic drive conditions. In addition to another grant for my work on [an ADRV9026-based measurement system](({{ '/_posts/2025-10-19-SDP_ADRV9026' | relative_url }})).

## More Personal Work Includes...
Designing a Phase-Locked Loop for a Frequency-Modulated Continuous-Wave Ground Penetrating Radar using ADIsimPLL and Analog Devices’ ADF4159, achieving exceptionally low frequency and phase error for clean chirp generation and robust time–frequency coherence 
(<span style="font-size:0.95rem; color:#1d4ed8;">[System build ongoing]({{ site.baseurl }}/_posts/2025-01-05-PLL for GPR)</span>).
Complementing this, I earned a professional certificate in PCB fabrication (2023), built a [1.8 GHz Class-A single-transistor PA](({{ '/_posts/2025-05-12-ATF38143' | relative_url }}))
, and executed multi-layer PCB processes from layout through chemical etching. Beyond single blocks, I’ve planned 
[complete RF line-ups](({{ '/_posts/2025-04-29-RF Lineup' | relative_url }})) 
in Keysight ADS  to a fixed budget and target transmission characteristics (C/IMD3 and P1dB), translating datasheet constraints into practical design trade-offs.
<link rel="icon" href="/assets/img/Keysight_favicon.ico" type="image/x-icon">

Outside the lab, I have organized an [IEEE ComSoc workshop at AUS using SDRs and GNU Radio](({{ '/_posts/GNU Radio Workshop' | relative_url }}))—demonstrating analog modulation chains and digital payload construction with BPSK, QPSK, and QAM. I’m currently developing a third-party applet for the ADRV9026 evaluation kit to interface with the onboard FPGA, automate waveform configuration and TX/RX scripting, benchmark DUTs, and characterize memory effects and static nonlinearities for next-gen transceivers.

## In the lab...
During my tenure as an undergraduate research assistant in the Advanced Radio Technologies Lab, I worked on offline digital predistortion (DPD) and RF power-amplifier behavioral modeling using machine-learning methods and measured IQ data. My previous experience with GMP-style modeling gave me a baseline for understanding PA nonlinearities, memory effects, AM/AM, AM/PM, NMSE, and ACLR.

Most of the work was measurement-driven. The data was largely collected through the team's ADRV9026-MB evaluation-board system and supporting lab measurement workflows. I worked with aligned input/output IQ captures, generated memory-aware feature matrices, trained PA behavioral models, and evaluated outputs using RF metrics rather than only generic ML loss values.

The main DPD direction used BiLSTM neural networks to model PA memory behavior. I converted I/Q samples into delay matrices, trained behavioral PA models, and used those models as differentiable surrogates. After training a PA model, I froze it, placed a trainable DPD model before it, and optimized the predistorter through the frozen PA model. This created an offline DPD workflow where hardware-measured behavior informed training without requiring the RF board to be in the optimization loop.

One of the most novel parts of the work was a spectral-output-aware loss function. Instead of optimizing only time-domain MSE or NMSE, I implemented a loss that reconstructs complex IQ, computes a spectrum, separates carrier and adjacent-channel regions, and penalizes adjacent-channel leakage. This made the DPD objective more directly aligned with ACLR improvement and spectral regrowth suppression.

Another major thread was efficient training and low-complexity modeling. I worked with memory-polynomial-style input matrices containing delayed I/Q and nonlinear envelope terms:

```text
num_features = 2 * memory_depth + (nonlinear_degree - 1) * memory_depth
```

I then studied how to select informative rows from those matrices. I compared peak-window selection, magnitude-sorted selection, partial-random selection, and PDF-preserving train/validation/test splits. A key lesson was that selecting only high-power peak samples can bias the training distribution toward nonlinear regions, so efficient selection has to preserve enough of the original signal distribution to make test NMSE meaningful.

I also explored lower-complexity neural PA models such as RVTDNN and ARVTDNN, including pruning workflows using TensorFlow Model Optimization. This connected model accuracy to deployment concerns such as parameter count, sparsity, memory footprint, and inference cost.

The work also included cross-PA transfer experiments. I tested whether dynamics learned from one PA could be reused for another by freezing larger recurrent blocks and retraining only smaller dense or gain-adaptation layers. This helped frame PA modeling as a combination of reusable memory dynamics and device-specific adaptation.

Representative results include BiLSTM behavioral models reaching around `-31 dB` to `-33 dB` NMSE in PA1/PA2 experiments, selected ARVTDNN-style runs around `-35 dB` NMSE, and spectral-loss DPD results improving ACLR from about `-28 dBc` before linearization to around `-44 dBc` after linearization in recorded outputs.

Overall, this research combined RF measurement practice, classical GMP intuition, neural sequence modeling, differentiable offline DPD, spectral optimization, memory-polynomial input selection, pruning, and parameter-efficient adaptation. It gave me experience moving from measured RF data to deployable ML modeling ideas while keeping evaluation tied to the metrics that matter in radio systems.



<!-- > Add Markdown syntax content to file `_tabs/about.md`{: .filepath } and it will show up on this page. -->

<!-- > This compilation of my work serves as a means for documenting the work rather than being a portfolio. Little effort will be made with regards to exagerating the achievements of the documented work. Finally, No guarantee is made on the correctness of the aforementioned work.
{: .prompt-info }


> I was about to place some lorem ipsum text here, but after giving it not so much thought, inserting a bit of SEO-friendly text for ATS, and optionally anyone who might actually read it, is the most viable option given the nonessential nature of this section, alongside the fact that it came from the site generator's theme as is.
{: style="font-size: 0.75rem;" }
{: .prompt-info } -->
