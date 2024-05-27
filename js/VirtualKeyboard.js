const VirtualKeyboard = function(parent, keyset) {
    this.option = {
        cursorTimer: 2000
    }
    this.parent = document.querySelector(`#${parent}`);
    this.keyboard = null;
    this.viewer = null;
    this.whitespace = null;
	this.storage = null;
    this.input = null;
    this.timer = null;
	this.placeholder = null;
	this.defaultValue_ = "";
    this.value = new Object({
        prev: "",
        current: "",
        next: "",
    });
    this.defaultSet = typeof keyset === 'undefined' ? "KOR" : keyset;
    this.defaultTheme = typeof keyset === 'undefined' ? "KOR" : keyset;
    this.currentSet = this.defaultSet;
    this.shift = false;
    this.CursorTimer = null;
    this.InputTimer = new Object({
		remainSeconds: 0,
		handler: null
	});
    this.alertEffect = null;
    this.AlertTimer = null;
    this.valid = false;
    this.confirmed = false;
    this.callback_ = null;
	this.FnKey = function(Super) {
		this.Super = Super;
		this.Fn = null;
		this.name = "";
		this.value = null;
		this.create = false;
		this.use = false;
		this.setName = (name) => {
			this.name = name;
			return this;
		}
		this.setValue = (value) => {
			this.value = value;
			return this;
		}
		this.setCreate = (create) => {
			this.create = create;
			return this;
		}
		this.setUse = (use) => {
			this.use = use;
			return this;
		}
		this.setFn = (Fn) => {
			this.Fn = new Fn(this);
			return this;
		}
		this.set = () => {
			if (!this.Fn) return;
			document.querySelector(`#${this.Fn.id}`).addEventListener("click", this.Fn.function);
		}
		return this;
	}
    this.functions = {
        shift: function Shift(Key) {
            this.id = "shift";
            this.function = () => {
				Key.Super.shift = Key.Super.shift ? false : true;
				Key.Super.set(Key.Super.currentSet);
			}
        },
        switch: function Switch(Key) {
            this.id = "switch";
            this.function = () => {
				if (Key.Super.CursorTimer != null) clearTimeout(Key.Super.CursorTimer);
				Key.Super.shift = false;
				Key.Super.value.prev += Key.Super.value.current;
				Key.Super.value.current = "";
				Key.Super.apply();
				Key.Super.set(Key.value);
            }
        },
        space: function Space(Key) {
            this.id = "space";
			this.value = " ";
			this.function = () => {
                Key.Super.completeByCondition(this.value);
            },
            this.handle = () => {
                if (Key.Super.getValue() == "") {
                    document.querySelector(`#${this.id}`).classList.add("disabled");
                } else {
                    if (Key.use) {
                        document.querySelector(`#${this.id}`).classList.remove("disabled");
                	}
                }
            }
        },
        backspace: function Backspace(Key) {
            this.id = "backspace";
            this.function = () => {
				if (Key.Super.CursorTimer) clearTimeout(Key.Super.CursorTimer);
				if (Key.Super.value.current == "") {
					if (Key.Super.value.prev == "") {
						Key.Super.alert();
						return;
					}
					let temp = Key.Super.value.prev.split("");
					temp.pop();
					Key.Super.value.prev = Hangul.assemble(temp);
				} else {
					let temp = Hangul.disassemble(Key.Super.value.current);
					temp.pop();
					Key.Super.value.current = Hangul.assemble(temp);
				}
				Key.Super.apply();
            }
        },
        enter: function Enter(Key) {
            this.id = "enter";
            this.function = () => {
				if (!Key.Super.checkValid()) return;
				if (Key.Super.CursorTimer != null) clearTimeout(Key.Super.CursorTimer);
				Key.Super.value.prev += (Key.Super.value.current += Key.Super.value.next);
				Key.Super.value.current = "";
				Key.Super.value.next = "";
				Key.Super.apply();
				Key.Super.confirmed = true;
				Key.Super.keyboard.classList.add("confirmed");
				Key.Super.viewer.classList.add("confirmed");
				if (Key.Super.callback_) Key.Super.callback_();
            }
        }
    },
    this.keyset = {
        KOR: {
            type: {
                language: [
                    [["ㅂ", "ㅃ"], ["ㅈ", "ㅉ"], ["ㄷ", "ㄸ"], ["ㄱ", "ㄲ"], ["ㅅ", "ㅆ"], "ㅛ", "ㅕ", "ㅑ", ["ㅐ", "ㅒ"], ["ㅔ", "ㅖ"]],
                    ["ㅁ", "ㄴ", "ㅇ", "ㄹ", "ㅎ","ㅗ", "ㅓ", "ㅏ", "ㅣ"],
                    ["ㅋ", "ㅌ", "ㅊ", "ㅍ", "ㅠ", "ㅜ", "ㅡ"]
                ],
                function: [
                    [
                    	new this.FnKey(this).setFn(this.functions.shift).setName("shift").setUse(true),
                    	new this.FnKey(this).setFn(this.functions.switch).setName("ENG.").setValue("ENG").setUse(true),
                    	new this.FnKey(this).setFn(this.functions.space).setName("공백").setUse(false),
                    	new this.FnKey(this).setFn(this.functions.backspace).setName("←").setUse(true),
                    	new this.FnKey(this).setFn(this.functions.enter).setName("입력완료").setUse(true)
                    ]
                ]
            },
            option: {
				maxLength: 0,
				minLength: 2,
                buttonElement: "div",
                switch: "ENG"
            },
			theme: "language"
        },
        ENG: {
            type: {
                language: [
                    [["q", "Q"], ["w", "W"], ["e", "E"], ["r", "R"], ["t", "T"], ["y", "Y"], ["u", "U"], ["i", "I"], ["o", "O"], ["p", "P"]],
                    [["a", "A"], ["s", "S"], ["d", "D"], ["f", "F"], ["g", "G"], ["h", "H"], ["j", "J"], ["k", "K"], ["l" ,"L"]],
                    [["z", "Z"], ["x", "X"], ["c", "C"], ["v", "V"], ["b", "B"], ["n", "N"], ["m", "M"]]
                ],
                function: [
                    [
                    	new this.FnKey(this).setFn(this.functions.shift).setName("shift").setUse(true),
                    	new this.FnKey(this).setFn(this.functions.switch).setName("한국어").setValue("KOR").setUse(true),
                    	new this.FnKey(this).setFn(this.functions.space).setName("Space").setUse(true),
                    	new this.FnKey(this).setFn(this.functions.backspace).setName("←").setUse(true),
                    	new this.FnKey(this).setFn(this.functions.enter).setName("Done").setUse(true)
                    ]
                ]
            },
            option: {
				maxLength: 0,
                minLength: 2,
                buttonElement: "div",
                switch: "KOR"
            },
			theme: "language"
        },
		NUM: {
            type: {
                number: [
                    ["1", "2", "3"],
                    ["4", "5", "6"],
                    ["7", "8", "9"],
                    ["0"]
                ],
                function: [
                    [
						new this.FnKey(this).setFn(this.functions.backspace).setName("←").setUse(true)
                    ]
                ]
            },
            option: {
				maxLength: 4,
                minLength: 4,
                buttonElement: "div",
                valueElement: "span",
				placeholder: "0000",
            },
			theme: "number"
        },
        PHONE: {
            type: {
                number: [
                    ["1", "2", "3"],
                    ["4", "5", "6"],
                    ["7", "8", "9"],
                    ["0"]
                ],
                function: [
                    [
						new this.FnKey(this).setFn(this.functions.backspace).setName("←").setUse(true)
                    ]
                ]
            },
            option: {
				maxLength: 11,
				minLength: 11,
                buttonElement: "div",
                valueElement: "span",
				placeholder: "01000000000"
            },
			theme: "number"
        },
		REGNUM: {
            type: {
                number: [
                    ["1", "2", "3"],
                    ["4", "5", "6"],
                    ["7", "8", "9"],
                    ["0"]
                ],
                function: [
                    [
						new this.FnKey(this).setFn(this.functions.backspace).setName("←").setUse(true)
                    ]
                ]
            },
            option: {
				maxLength: 13,
				minLength: 13,
                buttonElement: "div",
                valueElement: "span",
				placeholder: "0000000000000",
				hide: {
					indexes: [7, 8, 9, 10, 11, 12],
					cover: "*"
				}
            },
			theme: "number"
        }
    }

    this.readKeyset = () => {
        let keyAmount = new Object();
        Object.keys(this.keyset).forEach(set => {
            keyAmount[set] = 0;
            Object.keys(this.keyset[set].type).forEach(type => {
                if (type != "function") {
                    this.keyset[set].type[type].forEach(row => {
                        keyAmount[set] = row.length > keyAmount[set] ? row.length : keyAmount[set]
                    });
                }
            });
        });
        this.keyAmount = keyAmount;
    }
    
    this.set = (set) => {
        if (typeof set !== 'undefined') this.currentSet = set;
        if (this.viewer == null) {
            this.viewer = document.createElement("div");
            this.viewer.id = "vkeyboard_viewer";
            this.whitespace = document.createElement("div");
            this.whitespace.id = "whitespace";
            this.storage = document.createElement("div");
            this.storage.id = "storage";
			this.input = document.createElement("div");
			this.input.id = "input";
			this.cursor = document.createElement("i");
			this.placeholder = document.createElement("div");
			this.placeholder.id = "placeholder";
			this.storage.append(this.input);
			this.whitespace.append(this.storage)
			this.viewer.append(this.whitespace);
			this.viewer.append(this.placeholder);
			this.output.append(this.viewer);
        }
        if (this.keyboard == null) {
            this.keyboard = document.createElement("div");
            this.keyboard.id = "vkeyboard";
            this.parent.append(this.keyboard);
        }
        
        let keys = "";
        keys += `<div id="frame" class="${this.currentSet.toLowerCase()} ${this.keyset[this.currentSet].theme}">`;
        Object.keys(this.keyset[this.currentSet].type).forEach(type => {          
            this.keyset[this.currentSet].type[type].forEach(row => {
                keys += "<div>";
                row.forEach(key => {
                    const value = Array.isArray(key) ? key[this.shift ? 1 : 0] : key;
                    let button = "";
                    if (type == "function") {
                        button = `<${this.keyset[this.currentSet].option.buttonElement} id="${key.Fn.id}" class="basicButton key ${type}${key.use ? "" : " disabled"}" ${key.value == null ? "" : ` data-value="${key.value}"`}><div class="layer">${key.name}</div></${this.keyset[this.currentSet].option.buttonElement}>`;
                    } else {
                        button = `<${this.keyset[this.currentSet].option.buttonElement} class="basicButton key ${type}"><div class="layer">${value}</div></${this.keyset[this.currentSet].option.buttonElement}>`;
                    }
                    keys += button;
                });
                keys += "</div>";
            });
        });
        this.keyboard.innerHTML = keys;
		if (document.querySelector("#shift")) {
			this.shift ? document.querySelector("#shift").classList.add("on") : document.querySelector("#shift").classList.remove("on");
		}
		this.viewer.classList.remove("limit");
		Object.keys(this.keyset).forEach(set => {
			this.viewer.classList.remove(set.toLocaleLowerCase());
			this.viewer.classList.remove(this.keyset[set].theme);
		});
		this.viewer.classList.add(this.currentSet.toLowerCase());
		this.viewer.classList.add(this.keyset[this.currentSet].theme);
		if (this.keyset[this.currentSet].option.maxLength > 0) this.viewer.classList.add("limit");
        this.addEventListener();	
        this.setPlaceHolder();
        this.apply();

		return this;
    }

	this.addEventListener = () => {
        this.keyset[this.currentSet].type.function.forEach(row => {
            row.forEach(Key => {
                Key.set();
            });
        });

        document.querySelectorAll(".key:not(.function)").forEach(key => {
            key.addEventListener("click", () => {
                if (this.CursorTimer != null) {
					clearTimeout(this.CursorTimer);
					this.CursorTimer = null;
				}
                this.completeByCondition(key.textContent);
                if (this.shift) {
                    this.shift = false;
                    this.set();
                }
                if (this.currentSet != "KOR") return;
                this.CursorTimer = setTimeout(() => {
                    this.value.prev += this.value.current;
                    this.value.current = "";
                    this.apply();
                }, this.option.cursorTimer);
            });
        });           
        
        this.output.addEventListener("click", (event) => {
            if (event.target.tagName != "EM") {
                this.value.prev += (this.value.current += this.value.next);
                this.value.current = "";
                this.value.next = "";
                this.apply();
            }
        });
    }

    this.startTimer = (seconds, callback) => {
        if (!this.timer) {
            this.timer = document.createElement("div");
            this.timer.id = "timer";
            this.viewer.append(this.timer);
        }
        if (this.InputTimer.handler) {
			clearInterval(this.InputTimer.handler);
			this.InputTimer.handler = null;
		}
		
		const safeSeconds = typeof seconds === 'number' ? parseInt(seconds) : 0;
		if (safeSeconds < 1) return;

		this.InputTimer.remainSeconds = seconds;
		this.timer.textContent = this.secondToTime(this.InputTimer.remainSeconds);

		this.InputTimer.handler = setInterval(() => {
			this.InputTimer.remainSeconds -= this.InputTimer.remainSeconds > 0 ? 1 : 0;
			this.timer.textContent = this.secondToTime(this.InputTimer.remainSeconds);
			if (this.InputTimer.remainSeconds == 0) {
				clearInterval(this.InputTimer.handler, callback);
				
			}
		}, 1000);

		return this;
	}

    this.defaultValue = (value) => {
		this.defaultValue_ = value;
        this.value.prev += value;
		return this;
    }
    
    this.callback = (callback) => {
        if (typeof callback !== 'function') return;
        this.callback_ = callback;
        return this;
    }

    this.appendValue = () => {
        const target = this.input;
        this.value.current ==  "" ? this.viewer.classList.remove("on") : this.viewer.classList.add("on");
		this.cursor.remove();
        let html = "";
        if (this.value.prev == "" && this.value.current == "") {
            html = '<span id="cursor" class="empty"></span>';
        } 
        target.innerHTML = html;
		let index = 0;
        Object.keys(this.value).forEach(value => {
            this.value[value].split("").forEach((char, i) => {
                const wrapper = document.createElement("em");
				wrapper.classList.add("value");
                wrapper.innerHTML = char == " " ? "&nbsp" : this.hide(char, index);
                if (this.value.current != "") {
                    if (value == "current") {
                        wrapper.id = "cursor";
                        wrapper.classList.add("on");
                    }
                } else {
                    if (value == "prev" && i == this.value["prev"].length - 1) {
                        wrapper.id = "cursor";
                    }
                }
                target.append(wrapper);
				wrapper.setAttribute("data-index", index);
				index ++;

				wrapper.addEventListener("click", (event) => {
					if (this.CursorTimer != null) {
						clearTimeout(this.CursorTimer);
						this.CursorTimer = null;
					}
					let index = wrapper.getAttribute("data-index");
					if (event.clientX < wrapper.getBoundingClientRect().left + (wrapper.offsetWidth / 2)) {
						index --;   
					}
					const prev = index > -1 ? Hangul.assemble(this.getValue().split("").splice(0, parseInt(index) + 1)) : "";
					const next = Hangul.assemble(this.getValue().split("").splice(parseInt(index) + 1, this.getValue().split("").length));
					this.value.prev += this.value.current;
					this.value.current = "";
					this.value.prev = prev;
					this.value.next = next;
	
					this.appendValue();
				});
            });
        });

		if (target.innerHTML == "") target.innerHTML = '<span id="cursor" class="empty"></span>';
        if (document.querySelector("#cursor")) {
            document.querySelector("#cursor").append(this.cursor);
        }		
    }

	this.handleSpace = () => {
		this.keyset[this.currentSet].type.function.forEach(row => {
			row.forEach(Key => {
				if (Key.Fn.constructor.name == "Space") {
					Key.Fn.handle();
				}
			});
		});
	}

    this.apply = () => {
        this.checkLimit();
        this.checkValid();
        this.cancelConfirm();
		
        this.appendValue();
        this.handleSpace();
		if (this.callback_) this.callback_();
    }

    this.cancelConfirm = () => {
        this.confirmed = false;
        this.keyboard.classList.remove("confirmed");
        this.viewer.classList.remove("confirmed");
    }

    this.setPlaceHolder = () => {
        this.placeholder.innerHTML = null;
        if (typeof this.keyset[this.currentSet].option.placeholder === 'undefined') return;
        this.keyset[this.currentSet].option.placeholder.split("").forEach(char => {
            const wrapper = document.createElement("em");
            wrapper.textContent = char == " " ? "&nbsp" : char;
            this.placeholder.append(wrapper);
        });
    }

    this.checkValid = () => {
        this.valid = false;
        this.keyboard.classList.remove("valid");
        const value = this.getValue();
        const chars = Hangul.disassemble(value);
        const requiredLength = this.keyset[this.currentSet].option.minLength;
        let containsHangul = false;
        chars.forEach(char => {
			if (Hangul.isConsonant(char) || Hangul.isVowel(char)) containsHangul = true;
        });
        if (value.replaceAll(" ", "") == "") return false;
		if (value.split("").pop() == " ") return false;
        if (containsHangul && !Hangul.isCompleteAll(value)) return false;
        if (requiredLength > 0 && value.length < requiredLength) return false;

        this.keyboard.classList.add("valid");
        this.valid = true
        return true;
    }

	this.hide = (char, index) => {
		let result = char;
		if (typeof this.keyset[this.currentSet].option.hide !== 'undefined') {
			this.keyset[this.currentSet].option.hide.indexes.forEach(target => {
				if (index == target) result = this.keyset[this.currentSet].option.hide.cover;
			});
		}
		return result;
	}

	this.init = () => {
        this.parent.innerHTML = "";
        this.output = document.createElement("div");
        this.output.id = "output";
        this.parent.prepend(this.output);
		this.keyboard = null;
		this.viewer = null;
		this.whitespace = null;
		this.storage = null;
		this.input = null;
		this.cursor = null;
		this.timer = null;
		this.placeholder = null;
		this.defaultValue_ = "";
		this.value = new Object({
            prev: "",
            current: "",
            next: "",
        });
		this.defaultSet = typeof keyset === 'undefined' ? "KOR" : keyset;
		this.currentSet = this.defaultSet;
		this.shift = false;
		this.CursorTimer = null;
		this.InputTimer = new Object({
			remainSeconds: 0,
			handler: null
		});
        this.AlertTimer = null;
        this.valid = false;
        this.confirmed = false;
        this.callback_ = null;

        if (document.querySelector(".alert")) {
            document.querySelectorAll(".alert").forEach(alert => {
                alert.remove();
            });
        }
		this.readKeyset();

		return this;
	}

	this.secondToTime = () => {
		const min = Math.floor(this.InputTimer.remainSeconds / 60).toString();
		const sec = (this.InputTimer.remainSeconds % 60).toString();
		return (min.length == "1" ? 0 + min : min) + ":" + (sec.length == "1" ? 0 + sec : sec);
	}
    
    this.checkLimit = () => {
        let isLimit = false;
        if (this.keyset[this.currentSet].option.maxLength > 0 
            && (this.getValue()).length >= this.keyset[this.currentSet].option.maxLength) {
            if (!this.viewer.classList.contains("lock")) this.viewer.classList.add("lock");
            isLimit = true;
        } else {
            this.viewer.classList.remove("lock");
        }
        return isLimit;
    }

    this.resetValue = () => {
        this.value.prev = "";
        this.value.current = "";
        this.value.next = "";
        this.apply();
        return this;
    }

    this.alert = () => {
        if (this.alertEffect) this.alertEffect.remove();
        this.alertEffect = document.createElement("div");
        this.alertEffect.classList.add("alertEffect");
        this.output.append(this.alertEffect);
        if (this.AlertTimer) {
            clearTimeout(this.AlertTimer)
            this.AlertTimer = null;
        }
        this.AlertTimer = setTimeout(() => {
            this.alertEffect.remove();
        }, 1000)
    }

    this.completeByCondition = char => {
		if (this.viewer.classList.contains("lock")) {
            this.alert();
            return;
        }
        if (!Hangul.isConsonant(char) && !Hangul.isVowel(char) && char != " ") {
            this.value.prev += this.value.current + char;
            this.value.current = "";
            this.apply();
            return;
        }
        const temp = Hangul.assemble(Hangul.disassemble(this.value.current + char)).split("");
        if (char == " ") {
            if (this.value.current == "") {
                this.value.prev += temp[0];
                this.value.current = "";
            } else {
                this.value.prev += this.value.current;
                this.value.current = "";
            }                   
        } else if (temp.length > 1) {
            this.value.prev += temp[0];
            this.value.current = temp[1];
        } else {
            this.value.current = temp[0];
        }
        this.apply();
    }

    this.getValue = () => {
        return this.value.prev + this.value.current + this.value.next;
    }

    return this.init();
}