### Extreme Weather Event Temperature Analysis

The purpose of this analysis is to enable planning for extreme weather events.

#### Context

The climate at a specific location (as recorded by observations) can be seen as a sample from a "real" probability distribution function (PDF).  A climate model defines a set of polygons covering the earth. Results are typically hourly predictions (over the next several decades, starting from 10-20 years ago). Using a NASA based downscaled, normalized climate models to analyze what is the highest / lowest temperature that is likely to be reached, for some period of time (e.g., one day), during some period of time (e.g., 2024 or 2030-2040) with X% likelihood (for X=1% and X=5%). To answer this question, reconstruct the PDF of the variable (highest or lowest temperature) in question and then answer the question by sampling from this PDF.

￼![Max Temperature, GaussianMixture Fits Across Decades, N=520](https://github.com/user-attachments/assets/eb3149b2-4230-47be-958a-b3c6a3b322e5)


#### Constructing the PDF

We quantize the temperature into  ranges and build the histogram of temperatures vs the number of days where that is the highest temperature. The probability of the highest temperature being  can be read off this histogram. This is a very conservative approach, where the temperatures are bound to within the range of predictions for that year. Given that the table from the model itself is just an estimate, the actual highest temperature could indeed be higher than what is in the table. The next approach tries to do this.

We can fit a distribution to the points in the table. We experiment with Gaussian, Gamma, and mixture of Gaussians. We notice that the problem with simple Gaussian and Gamma is that while they do predict much higher temperatures, they are not aware of physical limits (e.g., they assign a non-zero probability to the temperature exceeding an unrealistic value).  So, as the time period (over which the prediction is done) gets longer, the probability of much more extreme events goes up, well into unrealistic territory. We notice that mixture of Gaussians does have more realistic behavior.  The mixture of gaussians has the most realistic results.

￼![Ensemble (historical)  Fit GaussianMixture (N= 52)  Period (2000-2010)  Orange County](https://github.com/user-attachments/assets/bcec292a-be6d-41f9-af5a-add609f4563f)

The chart above essentially computes the 1 - in - X (Year) probability of a heatstorm using a mixture of Guassians (probability distributions) that are aware of physical limits of a temperature range which eliminates unrealistic values.  

