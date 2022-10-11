let suma = (a,b) => a + b;

let sumaPromise = (a,b) => {
    return new Promise((resolve, reject) => {
        true ? setTimeout(() => {
            resolve(a+b);
        }, 3000) : reject(new Error('TESTING ERROR'))
    });
}

let sumaExec = async () => {
    const sumResult = await sumaPromise(2,3)
    console.log(sumResult)
}

sumaExec();