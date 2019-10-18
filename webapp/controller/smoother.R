## Calibration smoother

low <- read.csv("cal_100_264_low.txt", header = FALSE)
high <- read.csv("cal_1k_264_high.txt", header = FALSE)

dat <- rbind(low, high)
with(dat, plot(V1,V2, log='xy'))
sm <- with(dat, smooth.spline(V1, V2))
with(sm, points(x,y, col="red"))

with(dat, plot(V1,V3, log='xy'))
sp <- with(dat, smooth.spline(V1,V3))
with(sp, points(x,y, col="red"))

newframe <- data.frame(f = dat$V1, m = sm$y, p= sp$y)
write.table(newframe, "SmoothCal2.txt", 
            row.names=F, col.names=F, 
            sep=",")
