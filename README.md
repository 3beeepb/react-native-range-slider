# react-native-range-slider [![npm version](https://badge.fury.io/js/%403beeepb%2Freact-native-range-slider.svg)](https://badge.fury.io/js/%403beeepb%2Freact-native-range-slider) ![NPM](https://img.shields.io/npm/l/@3beeepb/react-native-range-slider) ![](https://img.shields.io/badge/platforms-android%20%7C%20ios-lightgrey)

A cross-platform (iOS / Android) implementation of Range Slider for React Native.

## Demo

<img src="https://github.com/3beeepb/react-native-range-slider/assets/3652498/58148ff5-25aa-4263-8c91-8c4d0adc072a" width="300">

## Installation

* npm: `npm install --save @3beeepb/react-native-range-slider --save`

## Usage

RangeSlider uses react hooks, so this component doesn't work with React Native versions below 0.59.0

1. Import the library

    ```js
    import RangeSlider from '@3beeepb/react-native-range-slider';
    ```

2. Just use it like this:

- Handler callback

    ```js
    const handleValueChange = useCallback((low, high, isUpdate) => {
      if (isUpdate) {
        setLow(low);
        setHigh(high);
      }
    }, []);
    const handleChange = useCallback(() => {
      // release thumb
    }, []);
    ```

- JSX

    ```jsx
    <RangeSlider
      style={styles.slider}
      min={0}
      max={100}
      onChange={handleChange}
      onValueChanged={handleValueChange}
    />
    ```

### Properties

| Name |      Description      | Type | Default Value |
| --- | --- | --- | :-------------: |
| `min` |  Minimum value of slider | number | _**required**_ |
| `max` |  Maximum value of slider | number | _**required**_ |
| `step` |  Step of slider | number | `1` |
| `low` |  Low value of slider | number | Initially `min` value will be set if not provided |
| `high` |  High value of slider | number | Initially `max` value will be set if not provided |
| `floatingLabel` |  If set to `true`, labels will not take space in component tree. Instead they will be rendered over the content above the slider (like a small popup). | boolean | `false` |
| `disableRange` | Slider works as an ordinary slider with only one control if `true` | boolean | `false` |
| `disabled` | Any user interactions will be ignored if `true` | boolean | `false` |
| `allowLabelOverflow` | If set to `true`, labels are allowed to be drawn outside of slider component's bounds.<br/>Otherwise label's edges will never get out of component's edges. | boolean | `false` |
| `renderThumb` | Should render the thumb. | `() => Node` | `undefined` |
| `renderRail` | Should render the "rail" for thumbs.<br/>Rendered component **should** have `flex: 1` style so it won't fill up the whole space. | `() => Node` | `undefined` |
| `renderRailSelected` | Should render the selected part of "rail" for thumbs.<br/>Rendered component **should not** have `flex: 1` style so it fills up the whole space. | `() => Node` | `undefined` |
| `renderLabel` | Should render label above thumbs.<br/>If no function is passed, no label will be drawn. | `(value: number) => Node` | `undefined` |
| `renderNotch` | Should render the notch below the label (above the thumbs).<br/>Classic notch is a small triangle below the label.<br/>If `allowLabelOverflow` is not set to true, the notch will continue moving with thumb even if the label has already reached the edge of the component and can't move further.| `() => Node` | `undefined` |
| `onValueChanged` | Will be called when a value was changed.<br/>If `disableRange` is set to true, the second argument should be ignored.<br/>`isUpdate` will be true if the value was changed by user's interaction. | `(low: number, high: number, isUpdate: boolean) => void` | `undefined` |
| `onChanged` | Will be called when a user release thumb. | `() => void` | `undefined` |

All the other props (e.g. style) will be passed to root container component.

## Contribution

Please make sure to run the tests before proposing a PR by running `npm test`.
