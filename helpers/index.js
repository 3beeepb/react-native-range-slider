export const isLowCloser = (downX, lowPosition, highPosition) => lowPosition === highPosition ? downX < lowPosition : Math.abs(downX - lowPosition) < Math.abs(downX - highPosition);

export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const getValueForPosition = (positionInView, containerWidth, thumbWidth, min, max, step) => {
    const relStepUnit = step / (max - min);
    let relPosition = (positionInView - thumbWidth / 2) / (containerWidth - thumbWidth);
    const relOffset = relPosition % relStepUnit;
    relPosition -= relOffset;
    if (relOffset / relStepUnit >= .5) relPosition += relStepUnit;
    return clamp(min + Math.round(relPosition / relStepUnit) * step, min, max);
};