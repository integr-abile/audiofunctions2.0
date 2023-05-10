var MathExpression = require("math-expressions");
var lescape = require("escape-latex");
var fnCompiler = require("interval-arithmetic-eval");

class FunctionValidator {
  validate(latexFnString) {
    console.log("Validate da passare latex " + latexFnString);

    const mathExpression = MathExpression.fromLatex(latexFnString).toString();
    console.log("Validate da passare math expression " + mathExpression);
    const functionPlotFormula =
      this.#mathExpressionToFunctionPlot(mathExpression);
    console.log("Validate da passare a function plot " + functionPlotFormula);
    try {
      const compileRes = fnCompiler(functionPlotFormula);
      compileRes.eval({ x: 0 });
      console.log("Validate formula compilation success");
      return {
        error: null,
        forFnPlotFormula: functionPlotFormula,
      };
    } catch {
      console.error("Validate Failed to compile");
      return {
        error: "Formula inserita non valida",
        forFnPlotFormula: null,
      };
    }
    // const eLatex = lescape(latexFnString);
    // console.log("da valutare escaped " + eLatex);
  }

  toLatex(textFormula) {
    const mathExpression = this.#functionPlotToMathExpression(textFormula);
    const expression = MathExpression.fromText(mathExpression);
    return expression.toLatex();
  }

  #mathExpressionToFunctionPlot(mathExpressionFormula) {
    var toReturn = mathExpressionFormula;
    var exponentialRegex = /e\^(.*)/g;
    if (exponentialRegex.test(toReturn)) {
      toReturn = toReturn.replaceAll(exponentialRegex, "exp($1)"); //sostituisco e^ con exp
    }
    return toReturn;
  }

  #functionPlotToMathExpression(functionPlotFormula) {
    var toReturn = functionPlotFormula;
    const exponentialRegex = /exp\((.*)\)/g;
    if (exponentialRegex.test(toReturn)) {
      toReturn = toReturn.replaceAll(exponentialRegex, "e^($1)");
    }
    return toReturn;
  }
}

const functionValidator = new FunctionValidator();

export default ({ app }, inject) => {
  inject("functionValidator", functionValidator);
};
