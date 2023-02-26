export function ConvertFunction(value){
    //traduci left e right
    value = value.replaceAll('\\left', '(');
    value = value.replaceAll('\\right', ')');

    //traduce le funzioni trigonometriche
    value = value.replaceAll('\\sin', 'sin');
    value = value.replaceAll('\\cos', 'cos');
    value = value.replaceAll('\\tan', 'tan');
    value = value.replaceAll('\\arcsin', 'asin');
    value = value.replaceAll('\\arccos', 'acos');
    value = value.replaceAll('\\arctan', 'atan');
    value = value.replaceAll('\\sinh', 'sinh');
    value = value.replaceAll('\\cosh', 'cosh');
    value = value.replaceAll('\\tanh', 'tanh');

    //traduce le funzioni logaritmiche
    value = value.replaceAll('\\log', 'log');

    //traduce le funzioni esponenziali
    value = value.replaceAll('\\exp', 'exp');

    //traduce le funzioni di base
    value = value.replaceAll('\\sqrt', 'sqrt');

    //traduce \frac
    value = SubstituteFrac(value);

    //traduce il valore assoluto
    value = SubstituteAbs(value);

    //cambia le parentesi graffe con le tonde
    value = value.replaceAll('{', '(');
    value = value.replaceAll('}', ')');
    //cambia i backslash con gli slash
    value = value.replaceAll('\\', '/');

    //logga la formula dopo le modifiche
    //console.log("modificata:"+value);

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

function SubstituteAbs(value){
    //quando trovi aperta tonda + |, vai a | + chiusa tonda
    //e sostituisci con abs()

    //posizione dell'inizio del primo blocco
    var start1 = value.indexOf("(|");
    while (start1>-1){
      //posizione della fine del primo blocco
      var end1;

      var diff=1;
      for (end1=start1+2;end1<value.length;end1++){
        if (value[end1]=='('){
          diff++;
        }
        if (value[end1]==')'){
          diff--;
        }
        if (diff==0){
            if (end1<value.length-1 && value[end1+1]=='|'){
                break;
            }
        }
      }
      if (end1>=value.length){
        break;
      }

      //sostituisci
      value = value.substring(0,start1) + 'abs(' + value.substring(start1+2,end1) + ')'+ value.substring(end1+2);        
      start1 = value.indexOf("(|");
    }
    return value;
}