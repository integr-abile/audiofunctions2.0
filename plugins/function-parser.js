import _ from "lodash";

export default ({ app }, inject) => {
  class FunctionParser {
    static FunctionType = {
      TRAITS: "traits",
      PLAIN: "plain",
    };
    parse(fnString) {
      console.log("function string " + fnString);
      if (_.isNil(fnString)) {
        return {
          fn: null,
        };
      }
      let regexTraitsFunction = /\[(-?\d+),(-?\d+)\]([a-zA-Z0-9_^+*\/-]+);/g;
      let matches = fnString.match(regexTraitsFunction);
      let result = {};
      if (matches) {
        //se abbiamo a che fare con una funzione a tratti
        result.traits = [];
        result.functionType = FunctionParser.FunctionType.TRAITS;
        matches.forEach((match) => {
          let params = /\[(-?\d+),(-?\d+)\]([a-zA-Z0-9_^+*\/-]+);/.exec(match);
          if (params) {
            result.traits.push({
              lowerBound: params[1],
              upperBound: params[2],
              function: params[3],
            });
          }
        });
      } else {
        //la funzione è una funzione non a tratti
        result.fn = fnString;
        result.functionType = FunctionParser.FunctionType.PLAIN;
      }
      return result;
    }

    getFunctionForX(x, fnObj) {
      if (fnObj.functionType == FunctionParser.FunctionType.TRAITS) {
        let trait = _.find(fnObj.traits, function (traitObj) {
          return x >= traitObj.lowerBound && x < traitObj.upperBound;
        });
        if (!_.isNil(trait)) {
          return trait.function;
        }
        return null;
      } else {
        //se non è una funzione a tratti
        return fnObj.fn;
      }
    }

    isTraitFunction(fnObj) {
      return fnObj.functionType == FunctionParser.FunctionType.TRAITS;
    }
  }

  const functionParser = new FunctionParser();
  inject("functionParser", functionParser);
  inject("FunctionParser", FunctionParser);
};
