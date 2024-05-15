const apiKey = "580385480cd3ead0967a462479bb06bcf16867d76c373e3f8be51edf7e1b"
const cryptoBody = document.querySelector('[data-cryptoBody]')
const colorTheme = document.querySelector('[data-colorTheme]')
const usdToRub = document.querySelector('[data-usd]')
const eurToRub = document.querySelector('[data-eur]')
const gbpToRub = document.querySelector('[data-gbp]')
const headerDropdown = document.querySelector('[data-headerDropdown]')
const valuteName = document.querySelector('[data-valuteName]')
const form = document.querySelector('[data-form]')
const settings = document.querySelector('[data-setings]')
const tableFooterDropdown = document.querySelector('[data-menu-tfooter-dropdown]')
const favoriteDate = localStorage.getItem('coinList')

let themeValue = 'dark'
let controlValueVariable = 1_000_000_000_000
let valutePrice = 1
let valuteSimvol = "$"
let cryptoArrayName = []
let cryptoList = []
let rowQuantity = 10
let colomnIndex = 1
let settingsMenuLength
let favoriteCoinsList = {}


darkMode (themeValue)
// слушатель для смены цветовой темы
colorTheme.addEventListener('click', () => {
	darkMode (themeValue)
})

// слушатель блока смены валют
headerDropdown.addEventListener('click', (element) => {
	if (element.target.localName === 'li') {
		changeValute (element.target.innerText)
	}
})

// слушатель блока настроек отображения страницы слайдера
settings.children[1].addEventListener('click', (element) => {
	if (element.target.localName === 'li') {
		colomnIndex = element.target.innerHTML
		cryptoBodyData(cryptoList)
		tableFooterMenu (colomnIndex)
	}
})

// слушатель блока настроек отображения количества строк валют
tableFooterDropdown.addEventListener('click', (element) => {
	if (element.target.localName === 'li') {
		rowQuantity = element.target.innerHTML
		tableFooterDropdown.parentElement.children[0].innerHTML = `
		${rowQuantity}
		<svg class="button--dropdown_icon">
			<use xlink:href="../static/icons/interface-icon/interface-sprite.svg#arrow"></use>
		</svg>`
	cryptoBodyData(cryptoList)
	}
})

// слушатель инпута
form[0].addEventListener('input', () => {
	if (form[0].value.length > 0) {
		form.children[3].classList.remove('hidden')
		searchResult (getOptions (form[0].value, cryptoArrayName))
	} else {
		form.children[3].classList += ' hidden'
	}
})
form[0].addEventListener('focus', () => form.children[2].classList.add('rotate'))
form[0].addEventListener('blur', () => form.children[2].classList.remove('rotate'))

// слушатель на выпадающий список
form.children[3].addEventListener('click', (element) => {
	if (element.target.localName == 'li') {
		const newArr = [cryptoList[element.target.attributes[0].value - 1]]
		cryptoBodyData (newArr)
		form.children[3].classList += ' hidden'
		form[0].value = ''
	}
})

// слушатель избранных валют
cryptoBody.addEventListener('click', (element) => {
	if ( element.target.tagName == 'svg' || element.target.tagName == 'use') {
		let favoriteButton
		if (element.target.tagName == 'use') {
			favoriteButton = element.target.parentElement
		} else {
			favoriteButton = element.target
		}
		if (+favoriteButton.attributes[0].value == false) {
			favoriteButton.attributes[0].value = '1'
			favoriteButton.innerHTML = `
			<use xlink:href="../static/icons/interface-icon/interface-sprite.svg#star1"></use>
			`
		} else {
			favoriteButton.attributes[0].value = '0'
			favoriteButton.innerHTML = `
			<use xlink:href="../static/icons/interface-icon/interface-sprite.svg#star0"></use>
			`
		}
		const tdAttrValue = favoriteButton.parentElement.attributes[0].value 
		favoriteCoinsList[tdAttrValue] = !favoriteCoinsList[tdAttrValue]
		localStorage.setItem('coinList', JSON.stringify(favoriteCoinsList))
	}
	
})

// функция получения курса валют
async function cryptoData() {
	const apiUrl = `https://api.cryptorank.io/v1/currencies?api_key=${apiKey}`
	const response = await fetch(apiUrl)
	const data = await response.json()
	for (let i = 0; i < data.data.length; i++){
		cryptoList[i] = data.data[i]
		cryptoArrayName.push(`${data.data[i].rank}|${data.data[i].name} (${data.data[i].symbol})`)
		favoriteCoinsList[data.data[i].symbol] = false
	}
	if (favoriteDate == null || favoriteDate == '') {
		localStorage.setItem('coinList', JSON.stringify(favoriteCoinsList))
	} else {
		favoriteCoinsList = JSON.parse(favoriteDate)
	}
	cryptoBodyData(cryptoList)
}

cryptoData ()

// функция данных 
function cryptoBodyData (cryptoCoinArray) {
	settings.children[0].innerHTML = `Всего элементов ${cryptoCoinArray.length}`
	settingsMenuLength = Math.ceil(cryptoCoinArray.length / rowQuantity)
	tableFooterMenu (colomnIndex)
	cryptoBody.innerHTML = ''
	for (let i = (colomnIndex == 1 ? 0 : rowQuantity * (colomnIndex - 1)); i < (cryptoCoinArray.length > rowQuantity ? rowQuantity * colomnIndex : cryptoCoinArray.length); i++) { 
		let favoritesIndex = favoriteCoinsList[cryptoCoinArray[i].symbol] == false ? 0 : 1
		cryptoBody.innerHTML += `
		<tr class="crypto--body_wrapper">
			<td data-favorite-symbol='${cryptoCoinArray[i].symbol}'><svg data-favorite-valute='${favoritesIndex}' class="options--icon">
			<use xlink:href="../static/icons/interface-icon/interface-sprite.svg#star${favoritesIndex}"></use>
		</svg></td>  <!--Избранное--> 
			<td>${cryptoCoinArray[i].rank}</td> <!--Ранг-->
			<td><img src="../static/icons/crypto-icons/${cryptoCoinArray[i].symbol.toLowerCase()}.svg" alt="" class="crypto--icon"> ${cryptoCoinArray[i].name + ' ' + cryptoCoinArray[i].symbol}</td> <!--Название-->
			<td>${valuteSimvol}${cryptoCoinArray[i].values.USD.price / valutePrice > 1000 ? Math.round(cryptoCoinArray[i].values.USD.price / valutePrice) : (cryptoCoinArray[i].values.USD.price / valutePrice).toFixed(3)}</td> <!--Цена-->
			${cryptoCoinArray[i].values.USD.percentChange24h.toFixed(2) > 0 ? '<td class="green">' + cryptoCoinArray[i].values.USD.percentChange24h.toFixed(2) : '<td class="red">' + cryptoCoinArray[i].values.USD.percentChange24h.toFixed(2)}%</td> <!--Изм за 24 часа-->
			${cryptoCoinArray[i].values.USD.percentChange7d.toFixed(2) > 0 ? '<td class="green">' + cryptoCoinArray[i].values.USD.percentChange7d.toFixed(2) : '<td class="red">' + cryptoCoinArray[i].values.USD.percentChange7d.toFixed(2)}%</td> <!--Изм за 7 days-->
			<td>${valuteSimvol}${palaceNum(Math.round(cryptoCoinArray[i].values.USD.marketCap / valutePrice), controlValueVariable)}</td> <!--Капитализация-->
			<td>${valuteSimvol}${palaceNum(cryptoCoinArray[i].values.USD.volume24h / valutePrice, controlValueVariable) }</td> <!--Объём за 24 часа-->
			<td>${cryptoCoinArray[i].symbol} ${palaceNum(cryptoCoinArray[i].circulatingSupply, controlValueVariable) }</td> <!--В обращении-->
		</tr>
	`
	}
}

// Функция тёмной темы
function darkMode (colorMode) {
	const path = document.documentElement.style
	if (colorMode === 'dark') {
		path.setProperty('--text-color', 'white')
		path.setProperty('--background-color', '#161b20')
		path.setProperty('--allocation-color', '#292d30')
		path.setProperty('--icon--color', '#58667e')
		path.setProperty('--color-tab', '#063258')
		themeValue = 'light'
		buttonIcon(colorTheme, 'sun')
	} else {
		path.setProperty('--text-color', 'balck')
		path.setProperty('--background-color', 'white')
		path.setProperty('--allocation-color', '#eff2f5')
		path.setProperty('--icon--color', '#58667e')
		path.setProperty('--color-tab', '#eef4fa')
		themeValue = 'dark'
		buttonIcon(colorTheme, 'moon')
	}
}

// функция для замены иконки тёмной темы
function buttonIcon(tag, name) {
	tag.innerHTML = `
	<svg class="header--icon header--icon_${name}">
		<use xlink:href="../static/icons/interface-icon/interface-sprite.svg#${name}"></use>
	</svg>
	`
}

// функция для форматирования числа 
function palaceNum(num, controlValue) {
	let reduction
	if (num > 1_000_000_000_000_000) {
		reduction = 'Q'
	} else if (num > 1_000_000_000_000) {
		reduction = 'T'
	} else if (num > 1_000_000_000) {
		reduction = 'B'
	} else if (num > 1_000_000) {
		reduction = 'M'
	} else if (num > 1_000_000) {
		reduction = 'K'
	} else {
		reduction = ''
	}
	if (num < controlValue) {
		controlValue = controlValue / 1000
		return palaceNum(num, controlValue)
	} else {
		return ((num / controlValue).toFixed(2) + reduction)
	}
}

// апишка курса валют к рублю
function CBR_XML_Daily_Ru(coinList) {
	usdToRub.innerHTML = `Курс рубля к доллару: <p> ${coinList.Valute.USD.Value.toFixed(3)}</p> &#8381`
	eurToRub.innerHTML = `Курс рубля к евро: <p> ${ coinList.Valute.EUR.Value.toFixed(3)}</p> &#8381`
	gbpToRub.innerHTML = `Курс рубля к фунту стерлинга: <p> ${ coinList.Valute.GBP.Value.toFixed(3)}</p> &#8381`
}

// смена валюты на сайте
function changeValute (valute) {
	const dollarPrice = +usdToRub.children[0].innerHTML
	if (valute === 'RUB') {
		valuteSimvol = '₽'
		valutePrice = 1 / dollarPrice
	} else if (valute === 'GBP') {
		valuteSimvol = '£'
		valutePrice = +gbpToRub.children[0].innerHTML / dollarPrice
	} else if (valute === 'EUR') {
		valuteSimvol = '€'
		valutePrice = +eurToRub.children[0].innerHTML / dollarPrice
	} else if (valute === 'USD') {
		valuteSimvol = '$'
		valutePrice = 1
	}
	valuteName.innerHTML = `
	${valute} 
		<svg class="header--icon">
			<use xlink:href="../static/icons/interface-icon/interface-sprite.svg#arrow"></use>
		</svg>
	`
	cryptoBodyData (cryptoList)
}

// функция отображения результатов поиска
function searchResult (arr) {
	form.children[3].innerHTML = ''
	if (arr.length == 0) {
			form.children[3].innerHTML = `
			<li class="dropdown--item dropdown--item_nothing">Ничего не найдено</li>
			`
	} else {
		arr.forEach(element => {
			form.children[3].innerHTML += `
			<li data-rank="${element.split('|')[0]}" class="dropdown--item">${element.split('|')[1]}</li>
			`
		})
	}
}

// функция поиска
function getOptions (word, criptoList) {
	return criptoList.filter (coin => {
		const regex = new RegExp (word, 'gi')
		return coin.match(regex)
	})
}

function tableFooterMenu (activeElement) {
	const menu = settings.children[1].children[1]
	menu.innerHTML = ''
	for(let i = 1; i <= settingsMenuLength; i++) {
		if (i == activeElement) {
			menu.innerHTML += `
			<li class="settings--menu_item settings--menu_item-active">${i}</li>`
		} else {
			menu.innerHTML += `
			<li class="settings--menu_item">${i}</li>`
		}
	}
}

function leafThrough (simvol) {
	if (simvol == '+' & colomnIndex < settingsMenuLength)	{
		colomnIndex++
		tableFooterMenu (colomnIndex)
		cryptoBodyData(cryptoList)
	} else if (simvol == '-' & colomnIndex > 1) {
		colomnIndex--
		tableFooterMenu (colomnIndex)
		cryptoBodyData(cryptoList)
	}
}

// Задержка для добавления аттрибутов переключения окон крипты 
setTimeout(() => {
	document.querySelectorAll('[data-menuArrow]').forEach(element => {
		element.addEventListener('click', () => {
			leafThrough (element.attributes[0].value)
		})
	})
}, 500);
