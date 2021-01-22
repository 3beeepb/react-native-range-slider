import {StyleSheet} from 'react-native';

export default StyleSheet.create({
    controlsContainer: {
        flexDirection:'row',
        alignItems:'center'
    },
    highThumbContainer: {
        position:'absolute'
    },
    railsContainer: {
        ...StyleSheet.absoluteFillObject,
        flexDirection:'row',
        alignItems:'center'
    },
    labelFixedContainer: {
        alignItems:'flex-start'
    },
    labelFloatingContainer: {
        position:'absolute',
        left:0,
        right:0,
        alignItems:'flex-start'
    },
    touchableArea: {
        ...StyleSheet.absoluteFillObject
    },
    rail: {
		flex:1,
		height:2,
		borderRadius:4,
		backgroundColor:'#ccc'
	},
	railSelected: {
		height:2,
		backgroundColor:'#00a8dd'
	},
	thumb: {
		width:26,
		height:26,
		borderRadius:50,
		backgroundColor:'#00a8dd'
	}
});