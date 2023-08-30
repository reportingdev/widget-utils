const percentageChange = (oldValue:number,newValue:number) => {
  return (newValue - oldValue) / Math.abs(oldValue) * 100;
}

const calculatePercentage = (num1:number, num2:number) => {
  if (num2 === 0) {
    return 0;
  }
  return Math.round((num1 / num2) * 100);
};


export {
  percentageChange,
  calculatePercentage
};