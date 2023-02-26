export function ConvertFunction(value){
    //traduci left e right
    value = value.replace('\\left', '(');
    value = value.replace('\\right', ')');

    //traduce le funzioni trigonometriche
    value = value.replace('\\sin', 'sin');
    value = value.replace('\\cos', 'cos');
    value = value.replace('\\tan', 'tan');
    value = value.replace('\\arcsin', 'asin');
    value = value.replace('\\arccos', 'acos');
    value = value.replace('\\arctan', 'atan');
    value = value.replace('\\sinh', 'sinh');
    value = value.replace('\\cosh', 'cosh');
    value = value.replace('\\tanh', 'tanh');

    //traduce le funzioni logaritmiche
    value = value.replace('\\log', 'log');

    //traduce le funzioni esponenziali
    value = value.replace('\\exp', 'exp');

    //traduce le funzioni di base
    value = value.replace('\\sqrt', 'sqrt');

    //traduce \frac
    value = SubstituteFrac(value);

    //cambia le parentesi graffe con le tonde
    value = value.replace('{', '(');
    value = value.replace('}', ')');
    //cambia i backslash con gli slash
    value = value.replace('\\', '/');

    //logga la formula dopo le modifiche
    //console.log(value);

    //prova a compilare la formula, per vedere se è corretta
    var compile = require('interval-arithmetic-eval');
    try{      
      let compileRes = compile(value);
      compileRes.eval({x:0})        
      return value;
    } 
    catch(error){      
      return null;
      //console.log(error);
    }
}

function SubstituteFrac(value){
    //quando trovi \frac + aperta graffa, vai alla chiusa graffa
    //e sostituisci con /

    //posizione dell'inizio del primo blocco
    var start1 = value.indexOf("\\frac{");
    while (start1>-1){
      //posizione della fine del primo blocco
      var end1;

      var diff=1;
      for (end1=start1+6;end1<value.length;end1++){
        if (value[end1]=='{'){
          diff++;
        }
        if (value[end1]=='}'){
          diff--;
        }
        if (diff==0){
          break;
        }
      }
      if (end1>=value.length){
        break;
      }

      //posizione dell'inizio del secondo blocco
      var start2 = end1+1

      //posizione della fine del secondo blocco
      var end2;

      diff=1;
      for (end2=start2+1;end2<value.length;end2++){
        if (value[end2]=='{'){
          diff++;
        }
        if (value[end2]=='}'){
          diff--;
        }
        if (diff==0){
          break;
        }
      }
      if (end2>=value.length){
        break;
      }
      //sostituisci
      value = value.substring(0,start1) + '(' + value.substring(start1+6,end1) + ')/(' + value.substring(start2+1,end2) +')'+ value.substring(end2+1);        
      start1 = value.indexOf("\\frac{");
    }
    return value;
}