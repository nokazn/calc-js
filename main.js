'user strict'

const Store = (() => {
  const wm = new WeakMap()
  const _private = self => {
    return wm.get(self) || wm.set(self, {}).get(self)
  }
  return class Store {
    constructor () {
      this.lastFormulaObj = {}
      this.tmpFormulaObj = {
        num1: '',
        num2: '',
        ope: ''
      }
      this.answer = '0'

      _private(this).hasNum = num => {
        return /^[+-]?\d+$/.test(num)
      }
    }

    get num1 () {
      return this.tmpFormulaObj.num1
    }

    set num1 (inputNum) {
      if (inputNum === '0') {
        return
      } else if (inputNum === '.'){
        inputNum = '0.'
      } else if (inputNum == null) {
        inputNum = ''
      }
      this.tmpFormulaObj.num1 = inputNum
    }

    get num2 () {
      return this.tmpFormulaObj.num2
    }

    set num2 (inputNum) {
      if (inputNum === '0') {
        return
      } else if (inputNum === '.'){
        inputNum = '0.'
      } else if (inputNum == null) {
        inputNum = ''
      }
      this.tmpFormulaObj.num2 = inputNum
    }

    get ope () {
      return this.tmpFormulaObj.ope
    }

    set setOpe (inputOpe) {
      this.tmpFormulaObj.ope = inputOpe != null ?  inputOpe : ''
    }

    get hasNum1 () {
      return _private(this).hasNum(this.tmpFormulaObj.num1)
    }

    get hasNum2 () {
      return _private(this).hasNum(this.tmpFormulaObj.num2)
    }

    get hasOpe () {
      return !!this.tmpFormulaObj.ope
    }

    get isFirstFormula () {
      return !this.lastFormulaObj.ope
    }

    get tmpFormula () {
      const formula = store.tmpFormulaObj
      return `${formula.num1}${formula.ope}${formula.num2}`
    }

    get isNegativeNum1 () {
      return store.num1.indexOf('-') !== -1
    }

    get isNegativeNum2 () {
      return store.num2.indexOf('-') !== -1
    }

    initTmpFormula (num1, num2, ope) {
      this.lastFormulaObj = {...this.tmpFormulaObj}
      this.tmpFormulaObj = {
        num1: num1 || '',
        num2: num2 || '',
        ope: ope || ''
      }
    }

    clearTmpFormula () {
      this.tmpFormulaObj = {
        num1: '',
        num2: '',
        ope: ''
      }
      this.answer = 0
    }

    calc () {
      this.answer = (new Function (`"use strict"; return ${this.tmpFormula}`))().toString()
    }

    negate () {
      if (this.hasOpe) {
        console.log(this.isNegativeNum1)
        this.num2 = this.isNegativeNum2 ? this.num1.substr(2).slice(0, -1) : `(-${this.num2})`
      } else {
        console.log(this.isNegativeNum1)
        this.num1 = this.isNegativeNum1 ? this.num1.substr(2).slice(0, -1) : `(-${this.num1})`
      }
    }
  }
})()

Viewer = {
  _replaceFormula (formula) {
    return formula.replace(/\*|\//g, (match) => {
      return match === '*' ? '×' : match === '/' ? '÷' : match
    })
  },

  updateTmpFormulaBox (inputVal) {
    inputVal = this._replaceFormula(inputVal)
    document.getElementById('tmpFormulaBox').innerText = inputVal
  },

  pushTmpFormulaBox (inputVal) {
    inputVal = this._replaceFormula(inputVal)
    document.getElementById('tmpFormulaBox').innerText += inputVal
  },

  replaceTmpFormulaBox (inputVal, count = 1) {
    const text = document.getElementById('tmpFormulaBox').innerText
    const formula = this._replaceFormula(`${text.slice(0, -count)}${inputVal}`)
    document.getElementById('tmpFormulaBox').innerText = formula
  },

  updateAnswerBox (answer) {
    // answer =  answer.replace(/\((.*)\)/, '$1')
    document.getElementById('answerBox').innerText = answer || '0'
  },
}

const store = new Store()
Viewer.updateAnswerBox('0')

const buttonList = document.getElementsByTagName('button')
Array.prototype.forEach.call(buttonList, (ele) => {
  ele.addEventListener('click', (e) => {
    const inputVal = e.target.innerText
    console.log(store)
    console.log(store.tmpFormulaObj)
    console.log(store.tmpFormula)
  })
})

document.addEventListener('keydown', e => {
  console.log(e.key)
  if (/^[0-9]$|\./.test(e.key)) num(e.key)
  else if (/^\+|-|\*|\/$/.test(e.key)) ope(e.key)
  else if (e.key === 'Escape') clearAll()
  else if (e.key === 'Delete') cancel()
  else if (e.key === 'Backspace') backSpace()
  else if (e.key === '=') equ()
})

function ope (inputOpe) {
  if (store.hasOpe) {
    if (store.hasNum2) {
      store.calc()
      Viewer.pushTmpFormulaBox(`${store.num2}${inputOpe}`)
      Viewer.updateAnswerBox(store.answer)
      store.initTmpFormula(store.answer, null, inputOpe)
    } else {
      store.setOpe = inputOpe
      Viewer.replaceTmpFormulaBox(inputOpe)
    }
  } else {
    console.log(store.hasNum1)
    if (!store.hasNum1) {
      store.num1 = store.answer
    }
    store.setOpe = inputOpe
    Viewer.updateTmpFormulaBox(store.tmpFormula)
  }
}

function equ () {
  if (store.hasNum1) {
    if (store.hasOpe) {
      if (!store.hasNum2) {
        store.num2 = store.num1
      }
    } else {
      store.setOpe = store.lastFormulaObj.ope
      store.num2 = store.lastFormulaObj.num2
    }
  } else {
    store.num1 = store.answer
    store.setOpe = store.lastFormulaObj.ope
    store.num2 = store.lastFormulaObj.num2
  }
  store.calc()
  Viewer.updateAnswerBox(store.answer)
  Viewer.updateTmpFormulaBox('')
  store.initTmpFormula()
}

function num (inputNum) {
  if (store.hasOpe) {
    store.num2 += inputNum
    Viewer.updateAnswerBox(store.num2)
  } else {
    store.num1 += inputNum
    Viewer.updateAnswerBox(store.num1)
  }
}

function clearAll () {
  store.clearTmpFormula()
  Viewer.updateAnswerBox('0')
  Viewer.updateTmpFormulaBox('')
}

function cancel () {
  if (store.hasOpe) {
    store.setNum2 = ''
    Viewer.updateAnswerBox('0')
  } else {
    store.num1 = ''
    Viewer.updateAnswerBox('0')
  }
}

function backSpace () {
  if (store.hasOpe) {
    store.num2 = store.num2.slice(0, -1)
    Viewer.updateAnswerBox(store.num2)
  } else {
    store.num1 = store.num1.slice(0, -1)
    Viewer.updateAnswerBox(store.num1)
  }
}

function negate () {
  return
  store.negate()
  Viewer.updateAnswerBox(store.hasOpe ? store.num2 : store.num1)
}
