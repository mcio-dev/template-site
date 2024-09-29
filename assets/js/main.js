(function ($) {
	var $window = $(window),
		$body = $('body');
	breakpoints({
		xlarge: ['1281px', '1680px'],
		large: ['981px', '1280px'],
		medium: ['737px', '980px'],
		small: ['481px', '736px'],
		xsmall: [null, '480px']
	});
	if (browser.name == 'ie') $body.addClass('is-ie');
	$window.on('load', function () {
		window.setTimeout(function () { $body.removeClass('is-preload'); }, 100);
	});
})(jQuery);

streamSaver.mitm = "https://bukkit.mcio.dev/assets/res/mitm.html?version=2.0.0"

function $v(selector) {
	const element = $(selector)
	element.value = function () {
		if (element.attr("type") == "checkbox") {
			return element[0].checked
		} else {
			return element.val()
		}
	}
	return element
}
const $plugin = {
	name: $v("#plugin-name"),
	version: $v("#plugin-version"),
	package: $v("#plugin-package"),
	mainClass: $v("#plugin-mainclass"),
	apiVersion: $v("#plugin-api-version"),
	authors: $v("#plugin-authors"),
	settings: {
		bungeecord: $v("#plugin-settings-bungeecord"),
		vault: $v("#plugin-settings-vault"),
		database: $v("#plugin-settings-database"),
		dbReload: $v("#plugin-settings-db-reload"),
		ignore: $v("#plugin-settings-ignore"),
	},
}
const $command = {
	register: $v("#command-register"),
	name: $v("#command-name"),
	aliasEnable: $v("#command-alias-enable"),
	alias: $v("#command-alias"),
	description: $v("#command-description"),
}
const $depend = {
	minecraft: $v("#depend-minecraft"),
	paper: $v("#depend-paper"),
	shadowTarget: $v("#depend-shadow-target"),
	adventure: $v("#depend-adventure"),
	nbtapi: $v("#depend-nbtapi"),
	hikariCP: $v("#depend-hikaricp"),
}
const $other = {
	mythic: $v("#other-mythic"),
	playerPoints: $v("#other-playerpoints"),
}

$start.onclick = async () => {
	$start.setAttribute("disabled", undefined)
	$startText.innerHTML = "正在生成项目"
	try {
		const pluginName = $plugin.name.value()
		const pluginVersion = $plugin.version.value()
		let remotes = [
			{ name: "gradle/wrapper/gradle-wrapper.jar", url: "https://bukkit.mcio.dev/assets/project/gradle/wrapper/gradle-wrapper.jar"  },
			{ name: "gradlew", url: "https://bukkit.mcio.dev/assets/project/gradlew" },
			{ name: "gradlew.bat", url: "https://bukkit.mcio.dev/assets/project/gradlew.bat" },
		], plains = [
			{ name: "settings.gradle.kts", content: "rootProject.name = \"" + pluginName + "\"\n" },
		]

		// TODO: 根据网页配置 $plugin $command $depend $other，将代码加入到 plains 中

		const fileStream = streamSaver.createWriteStream(pluginName + '-' + pluginVersion + '.zip')
		const readableZipStream = new ZIP({
			start(ctrl) { },
			async pull(ctrl) {
				let arr = []
				remotes.forEach(el=>arr.push(new Promise(resolve=>{fetch(el.url).then(resp=>(resp.status==200)?()=>resp.body:null).then(stream=>{resolve({name:el.name,stream:stream})})})))
				plains.forEach(el=>arr.push(new Promise(resolve=>{resolve({name:el.name,stream(){return new ReadableStream({start(ctrl){ctrl.enqueue(new TextEncoder().encode(el.content));ctrl.close()}})}})})))
				await Promise.all(arr).then(res => {
					let nameMapList = []
					res.forEach(item => {
						let name = item.name
						const stream = item.stream
						let nameList = nameMapList.map(nameMap=>nameMap.name)
						if (nameList.indexOf(name) == -1) {
							nameMapList.push({ name: name, cnt: 0 })
						} else {
							let nameItem = nameMapList.find(item=>item.name==name)
							nameItem.cnt += 1
							let fileName = name.substring(0, name.lastIndexOf('.'))
							let suffix = name.substr(name.lastIndexOf('.'))
							name = fileName + "(" + nameItem.cnt + ")" + suffix
						}
						if (item.stream) ctrl.enqueue({ name, stream })
					})
				})

				ctrl.close()
			}
		})

		// more optimized
		if (window.WritableStream && readableZipStream.pipeTo) {
			return readableZipStream.pipeTo(fileStream).then(() => {
				console.log('done writing')
				$start.removeAttribute("disabled")
				$startText.innerHTML = "生成并下载项目"
			})
		}

		// less optimized
		const writer = fileStream.getWriter()
		const reader = readableZipStream.getReader()
		const pump = () => reader.read()
			.then(res => res.done ? writer.close() : writer.write(res.value).then(pump))

		pump()
	} catch (e) {
		console.log(e)
	}
	$start.removeAttribute("disabled")
	$startText.innerHTML = "生成并下载项目"
}
