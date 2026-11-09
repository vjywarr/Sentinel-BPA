SENTINEL-BPA IEEE OVERLEAF PROJECT (EXPANDED VERSION)

This archive contains the editable LaTeX source for the IEEEtran conference-style research paper. The manuscript has been expanded to approximately six pages while retaining the IEEE two-column layout. The added material explains the Earth Engine implementation, reproducibility settings, interpretation of area measures, spatial screening use, and proposed validation checks. No new measured results have been invented.

FILES
- main.tex: main IEEEtran LaTeX manuscript
- references.bib: BibTeX reference database
- figures/: three Google Earth Engine map screenshots

UPLOAD TO OVERLEAF
1. In Overleaf, choose New Project -> Upload Project.
2. Upload this ZIP file.
3. Open Menu and ensure main.tex is selected as the Main document.
4. Use pdfLaTeX as the compiler.
5. Click Recompile. If citations/references are not populated on the first pass, recompile again so BibTeX can run.
6. Check the compiled PDF page count and download the PDF for printing.

PROJECT SETTINGS AND INTERPRETATION
- District boundary: FAO/GAUL/2015/level2, filtered to India, Uttarakhand, Dehra Dun.
- Sentinel-2: COPERNICUS/S2_SR_HARMONIZED, 2024-01-01 to 2025-01-01, scene cloud metadata below 20; 169 images; median composite.
- Dynamic World: GOOGLE/DYNAMICWORLD/V1; annual mean built probability for 2016 and 2025; threshold > 0.5.
- Population: WorldPop/GP/100m/R2025A/v1/pop; years 2016 and 2025.
- High-density zone: 2025 population-density surface at or above the 75th percentile.
- The reported population values are modelled grid estimates, not census counts.
- The map screenshots document the Earth Engine outputs and are not independent validation data.
- No local classification accuracy assessment, service-demand calculation, or infrastructure-capacity assessment is claimed.
