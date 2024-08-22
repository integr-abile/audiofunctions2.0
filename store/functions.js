export const state = () => ({
  predefinedFunctions: [
    "((((2)/(3))x^(3)-1)/(x^(2)))-3cos(x)",
    "[0,150]-x+180;[150,244]30;[244,394]x-120-30*PI;",
    "[0,20](PI*x^2(30-x))/3;[20,25]16*PI*(x-20)+(4/3)*PI*1000;",
    "[-3,0]x^2;[0,3]x;", //funzione a tratti di esempio
    "0",
    "3",
    "x+3",
    "(1/2)(x+3)",
    "-x+3",
    "x^4",
    "x^2",
    "(1/2)x^2",
    "(1/2)abs(x)",
    "sqrt(x)",
    "(x^2)/(x^2+1)",
  ],

  xDomainDefaults:{
    xMin: -16,
    xMax: 16,
    step: 0.5
  },

  yDomainDefaults:{
    yMin: -9,
    yMax: 9,
    step:1
  },

  defaultFunction:{
    fn: "sin(x)"
  }
  
});

export const getters = {
  getPredefinedFunctions(state) {
    return state.predefinedFunctions;
  },
  getXDomainDefaults(state){
    return state.xDomainDefaults;
  },
  getYDomainDefaults(state){
    return state.yDomainDefaults;
  }
};
