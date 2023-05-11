var MathExpression = require("math-expressions");
var lescape = require("escape-latex");
var fnCompiler = require("interval-arithmetic-eval");

class FunctionValidator {
  validate(latexFnString) {
    console.log("Validate da passare latex " + latexFnString);

    // const mathExpression = this.#latexToMathExpression(latexFnString)
    const preprocessedLatex = this.#preprocessLatex(latexFnString);
    const mathExpression =
      MathExpression.fromLatex(preprocessedLatex).toString();
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
    console.log("verso latex fnPlotFormula " + textFormula);
    const mathExpression = this.#functionPlotToMathExpression(textFormula);
    console.log("verso latex math expression " + mathExpression);
    const expression = MathExpression.fromText(mathExpression);
    const latexExpression = expression.toLatex();
    console.log(
      "verso latex latex expression non normalizzata " + latexExpression
    );
    const normalizedLatex = this.#normalizeLatex(latexExpression);
    console.log("verso latex latex normalizzato " + normalizedLatex);
    // return expression.toLatex();
    return normalizedLatex;
  }
  //---------------------------//
  #preprocessLatex(latexFnString) {
    var toReturn = latexFnString;
    const ambiguousFunctionRegex = /\^{\\(sin|cos|tan)\s*\(*\s*.*\s*\)*/g;
    if (ambiguousFunctionRegex.test(toReturn)) {
      toReturn = toReturn.replaceAll(ambiguousFunctionRegex, function (match) {
        return "^{1" + match.substring(2); // Replace the matched function with "{1" + the original match without the "^{" characters.
      });
    }
    const absoluteValueRegex = /\\\|{([^}]*)}\\\|/g;
    if (absoluteValueRegex.test(toReturn)) {
      toReturn = toReturn.replaceAll(absoluteValueRegex, "\\abs($1)");
    }
    return toReturn;
  }

  #normalizeLatex(preprocessedLatex) {
    //è l'inversa di preprocessLatex
    console.log("preprocessedLatex " + preprocessedLatex);
    var toReturn = preprocessedLatex;
    const normalizeTrigonometricExponentialAmbiguousFunctionRegex =
      /\^{1\s*\\(sin|cos|tan)\s*\(*\s*.*\s*\)*/g;
    if (
      normalizeTrigonometricExponentialAmbiguousFunctionRegex.test(toReturn)
    ) {
      toReturn = toReturn.replace(
        normalizeTrigonometricExponentialAmbiguousFunctionRegex,
        function (match) {
          return match.replace("^{1", "^{");
        }
      );
    }
    const absoluteValueRegex = /abs\((.*)\)/g;
    if (absoluteValueRegex.test(toReturn)) {
      toReturn = toReturn.replaceAll(absoluteValueRegex, `\\|{$1}\\|`);
    }
    return toReturn;
  }

  //---------------------------------//
  #mathExpressionToFunctionPlot(mathExpressionFormula) {
    var toReturn = mathExpressionFormula;
    const exponentialRegex = /e\^(.*)\s*/g;
    if (exponentialRegex.test(toReturn)) {
      toReturn = toReturn.replaceAll(exponentialRegex, "exp($1)"); //sostituisco e^ con exp
    }
    const absoluteValueRegex = /\|(.+?)\|/g;
    if (absoluteValueRegex.test(toReturn)) {
      toReturn = toReturn.replaceAll(absoluteValueRegex, "abs($1)");
    }
    return toReturn;
  }

  #functionPlotToMathExpression(functionPlotFormula) {
    var toReturn = functionPlotFormula;
    const exponentialRegex = /exp\((.*)\)/g;
    if (exponentialRegex.test(toReturn)) {
      toReturn = toReturn.replaceAll(exponentialRegex, "e^($1)");
    }
    const absoluteValueRegex = /abs\((.*)\)/g;
    if (absoluteValueRegex.test(toReturn)) {
      toReturn = toReturn.replaceAll(absoluteValueRegex, `|($1)|`);
    }
    return toReturn;
  }
}

const functionValidator = new FunctionValidator();

export default ({ app }, inject) => {
  inject("functionValidator", functionValidator);
};
