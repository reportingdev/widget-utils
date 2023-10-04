import React from 'react';
import PropTypes from 'prop-types';
import './loading.css';
import { datasetGenerator } from '../../utils/generators';
import { Oval as Loader } from 'svg-loaders-react'
import { WidgetData } from '../../types/widget';

//type LoaderVariant = 'spinner' | 'bar' | 'circle';

interface LoaderProps {
  //variant?: LoaderVariant;
  color?: string;
  // other props
}

/**
 * Primary UI component for user interaction
 */
export const LoadingView = ({ color }:LoaderProps) => {
  const loaderStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)"
  };


  return (
    <div className='loading-overlay'>
      <Loader style={loaderStyle} stroke={color} className=''></Loader>
    </div>
  );
};

export const loadingDummyData = (fillValue:number):WidgetData=>{
  return {
    datasets: [{
        label: 'loading...',
        data: Array(28).fill(fillValue),
        dataType: 'number',
        backgroundColor: '#6b7280',
        aggregationType: 'total',
        changeRate: {value: 0,label: '0%'}
    }],
    dimension: datasetGenerator(1,'date')[0]
  };
}

LoadingView.propTypes = {
  color: PropTypes.string
};

LoadingView.defaultProps = {
  color: '#6B7280'
};
