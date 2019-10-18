#!/bin/bash

echo 10000 > /sys/devices/ocp.?/pwm_test_P8_13*/period
echo 5000 > /sys/devices/ocp.?/pwm_test_P8_13*/duty
exit 0


