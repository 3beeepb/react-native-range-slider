import React, {memo,useState,useEffect,useCallback,useMemo,useRef} from 'react';
import {Animated,PanResponder,View,ViewPropTypes} from 'react-native';
import PropTypes from 'prop-types';

// hooks
import {useThumbFollower,useLowHigh,useWidthLayout,useLabelContainerProps,useSelectedRail} from './hooks';

// helpers
import {clamp,getValueForPosition,isLowCloser} from './helpers';

// styles
import styles from './styles';

const trueFunc = () => true;
const noop = () => {};

const RangeSlider = (
    {
        min,
        max,
        step,
        low:lowProp,
        high:highProp,
        floatingLabel,
        allowLabelOverflow,
        disableRange,
        disabled,
        onValueChanged,
        onChange,
        renderThumb,
        renderLabel,
        renderNotch,
        renderRail,
        renderRailSelected,
        ...restProps
    }
) => {
    const renderThumbDefault = () => <View style={styles.thumb} />;
    const renderRailDefault = () => <View style={styles.rail} />;
    const renderRailSelectedDefault = () => <View style={styles.railSelected} />;

    renderThumb = renderThumb ? renderThumb : renderThumbDefault;
    renderRail = renderRail ? renderRail : renderRailDefault;
    renderRailSelected = renderRailSelected ? renderRailSelected : renderRailSelectedDefault;

    step = step || 1;

    const {inPropsRef,inPropsRefPrev,setLow,setHigh} = useLowHigh(lowProp,disableRange?max:highProp,min,max,step);
    const lowThumbXRef = useRef(new Animated.Value(0));
    const highThumbXRef = useRef(new Animated.Value(0));
    const pointerX = useRef(new Animated.Value(0)).current;
    const {current:lowThumbX} = lowThumbXRef;
    const {current:highThumbX} = highThumbXRef;

    const gestureStateRef = useRef({isLow:true,lastValue:0,lastPosition:0});
    const [isPressed,setPressed] = useState(false);

    const containerWidthRef = useRef(0);
    const [thumbWidth,setThumbWidth] = useState(0);

    const [selectedRailStyle,updateSelectedRail] = useSelectedRail(inPropsRef,containerWidthRef,thumbWidth,disableRange);

    const updateThumbs = useCallback(() => {
        const {current:containerWidth} = containerWidthRef;
        if (!thumbWidth || !containerWidth) return;
        const {low, high} = inPropsRef.current;
        if (!disableRange) {
            const {current:highThumbX} = highThumbXRef;
            const highPosition = (high - min) / (max - min) * (containerWidth - thumbWidth);
            highThumbX.setValue(highPosition);
        }
        const {current:lowThumbX} = lowThumbXRef;
        const lowPosition = (low - min) / (max - min) * (containerWidth - thumbWidth);
        lowThumbX.setValue(lowPosition);
        updateSelectedRail();
        onValueChanged(low,high,false);
    }, [disableRange,inPropsRef,max,min,onValueChanged,thumbWidth,updateSelectedRail]);

    useEffect(() => {
        const { lowPrev, highPrev } = inPropsRefPrev;
        if ((lowProp !== undefined && lowProp !== lowPrev) || (highProp !== undefined && highProp !== highPrev)) updateThumbs();
    }, [highProp,inPropsRefPrev.lowPrev,inPropsRefPrev.highPrev,lowProp]);

    useEffect(() => updateThumbs(), [updateThumbs]);

    const handleContainerLayout = useWidthLayout(containerWidthRef,updateThumbs);
    const handleThumbLayout = useCallback(({nativeEvent}) => {
        const {layout:{width}} = nativeEvent;
        if (thumbWidth !== width) setThumbWidth(width);
    }, [thumbWidth]);

    const lowStyles = useMemo(() => ({transform: [{translateX:lowThumbX}]}), [lowThumbX]);
    const highStyles = useMemo(() => (disableRange ? null : [styles.highThumbContainer,{transform:[{translateX:highThumbX}]}]),[disableRange,highThumbX]);

    const railContainerStyles = useMemo(() => ([styles.railsContainer,{marginHorizontal:thumbWidth/2}]), [thumbWidth]);

    const [labelView,labelUpdate] = useThumbFollower(containerWidthRef,gestureStateRef,renderLabel,isPressed,allowLabelOverflow);
    const [notchView,notchUpdate] = useThumbFollower(containerWidthRef,gestureStateRef,renderNotch,isPressed,allowLabelOverflow);
    const lowThumb = renderThumb();
    const highThumb = renderThumb();

    const labelContainerProps = useLabelContainerProps(floatingLabel);

    const {panHandlers} = useMemo(() => PanResponder.create({
        onStartShouldSetPanResponder: trueFunc,
        onStartShouldSetPanResponderCapture: trueFunc,
        onMoveShouldSetPanResponder: trueFunc,
        onMoveShouldSetPanResponderCapture: trueFunc,
        onPanResponderTerminationRequest: trueFunc,
        onPanResponderTerminate: trueFunc,
        onShouldBlockNativeResponder: trueFunc,

        onPanResponderGrant: ({nativeEvent}, gestureState) => {
            if (disabled) return;

            const {numberActiveTouches} = gestureState;
            if (numberActiveTouches > 1) return;

            setPressed(true);

            const {current:lowThumbX} = lowThumbXRef;
            const {current:highThumbX} = highThumbXRef;
            const {locationX:downX,pageX} = nativeEvent;
            const containerX = pageX - downX;

            const {low,high,min,max} = inPropsRef.current;
            const containerWidth = containerWidthRef.current;

            const lowPosition = thumbWidth / 2 + (low - min) / (max - min) * (containerWidth - thumbWidth);
            const highPosition = thumbWidth / 2 + (high - min) / (max - min) * (containerWidth - thumbWidth);

            const isLow = disableRange || isLowCloser(downX,lowPosition,highPosition);
            gestureStateRef.current.isLow = isLow;

            const handlePositionChange = (positionInView) => {
                const {low,high,min,max,step} = inPropsRef.current;
                const minValue = isLow ? min : low;
                const maxValue = isLow ? high : max;
                const value = clamp(getValueForPosition(positionInView,containerWidth,thumbWidth,min,max,step),minValue,maxValue);

                if (gestureStateRef.current.lastValue === value) return;

                const absolutePosition = (value - min) / (max - min) * (containerWidth - thumbWidth);
                gestureStateRef.current.lastValue = value;
                gestureStateRef.current.lastPosition = absolutePosition + thumbWidth / 2;
                (isLow ? lowThumbX : highThumbX).setValue(absolutePosition);
                onValueChanged(isLow ? value : low, isLow ? high : value, true);
                (isLow ? setLow : setHigh)(value);
                labelUpdate && labelUpdate(gestureStateRef.current.lastPosition,value);
                notchUpdate && notchUpdate(gestureStateRef.current.lastPosition,value);
                updateSelectedRail();
            };
            handlePositionChange(downX);
            pointerX.removeAllListeners();
            pointerX.addListener(({value:pointerPosition}) => handlePositionChange(pointerPosition - containerX));
        },

        onPanResponderMove: disabled ? undefined : Animated.event([null,{moveX:pointerX}],{useNativeDriver:false}),

        onPanResponderRelease: () => {
            if (onChange) onChange();
            setPressed(false);
        },
    }), [pointerX,inPropsRef,thumbWidth,disableRange,disabled,onValueChanged,onChange,setLow,setHigh,labelUpdate,notchUpdate,updateSelectedRail]);

    return (
        <View {...restProps}>
            <View {...labelContainerProps}>
                {labelView}
                {notchView}
            </View>
            <View onLayout={handleContainerLayout} style={styles.controlsContainer}>
                <View style={railContainerStyles}>
                    {renderRail()}
                    <Animated.View style={selectedRailStyle}>
                        {renderRailSelected()}
                    </Animated.View>
                </View>
                <Animated.View style={lowStyles} onLayout={handleThumbLayout}>
                    {lowThumb}
                </Animated.View>
                {!disableRange && <Animated.View style={highStyles}>{highThumb}</Animated.View>}
                <View {...panHandlers} style={styles.touchableArea} collapsable={false} />
            </View>
        </View>
    );
};

RangeSlider.propTypes = {
    ...ViewPropTypes,
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
    step: PropTypes.number,
    renderThumb: PropTypes.func,
    low: PropTypes.number,
    high: PropTypes.number,
    allowLabelOverflow: PropTypes.bool,
    disableRange: PropTypes.bool,
    disabled: PropTypes.bool,
    floatingLabel: PropTypes.bool,
    renderLabel: PropTypes.func,
    renderNotch: PropTypes.func,
    renderRail: PropTypes.func,
    renderRailSelected: PropTypes.func,
    onValueChanged: PropTypes.func,
    onChange: PropTypes.func
};

RangeSlider.defaultProps = {
    allowLabelOverflow: false,
    disableRange: false,
    disabled: false,
    floatingLabel: false,
    onValueChanged: noop,
    onChange: noop
};

export default memo(RangeSlider);