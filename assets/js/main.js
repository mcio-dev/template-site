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

function updateCommandState() {
    const enable = $command.register.value()
    const alias = $command.aliasEnable.value()
    console.log('enable: ' + enable + ', alias: ' + alias)
    if (!enable) {
        $command.name.prop('disabled', true)
        $command.aliasEnable.prop('disabled', true)
        $command.alias.prop('disabled', true)
        $command.description.prop('disabled', true)
    } else {
        $command.name.prop('disabled', false)
        $command.aliasEnable.prop('disabled', false)
        $command.alias.prop('disabled', !alias)
        $command.description.prop('disabled', false)
    }
}
$command.register.change(updateCommandState);
$command.aliasEnable.change(updateCommandState);

function generateCode(plains) {
    const push = function(name, content) {
        plains.push({ name: name, content: content });
    };
    push('.gitignore',
`.idea/
*.iml
*.ipr
*.iws
out/
.idea_modules/
atlassian-ide-plugin.xml
*.class
*.log
*.ctxt
*.jar
*.war
*.nar
*.ear
*.zip
*.tar.gz
*.rar
hs_err_pid*
*~
.fuse_hidden*
.directory
.Trash-*
.nfs*
.DS_Store
.AppleDouble
.LSOverride
Icon
._*
.DocumentRevisions-V100
.fseventsd
.Spotlight-V100
.TemporaryItems
.Trashes
.VolumeIcon.icns
.com.apple.timemachine.donotpresent
.AppleDB
.AppleDesktop
Network Trash Folder
Temporary Items
.apdisk
Thumbs.db
Thumbs.db:encryptable
ehthumbs.db
ehthumbs_vista.db
*.stackdump
[Dd]esktop.ini
$RECYCLE.BIN/
*.cab
*.msi
*.msix
*.msm
*.msp
*.lnk
.gradle
build/
gradle-app.setting
.gradletasknamecache
**/build/
run/
!gradle-wrapper.jar
!libs/*.jar
`);
    const package = $plugin.package.value()
    push('build.gradle.kts',
`plugins {
    java
    ` + '`maven-publish`' + `
    id ("com.github.johnrengelman.shadow") version "7.0.0"
}

group = "${package}"
version = "${$plugin.version.value()}"
val targetJavaVersion = 8
val shadowGroup = "${$depend.shadowTarget.value()}"

repositories {
    mavenLocal()
    mavenCentral()
    maven("https://repo.codemc.io/repository/maven-public/")
    maven("https://hub.spigotmc.org/nexus/content/repositories/snapshots/")`
+ ($depend.paper.value() ? `
    maven("https://repo.papermc.io/repository/maven-public/")` : ''
) + ($other.mythic.value() ? `
    maven("https://mvn.lumine.io/repository/maven/")` : ''
) + `
    maven("https://repo.helpch.at/releases/")
    maven("https://jitpack.io")
    maven("https://repo.rosewooddev.io/repository/public/")
}

dependencies {
    compileOnly("` + ($depend.paper.value() ? "io.papermc.paper:paper-api" : "org.spigotmc:spigot-api") + `:${$depend.minecraft.value()}-R0.1-SNAPSHOT")
    // compileOnly("org.spigotmc:spigot:${$depend.minecraft.value()}") // NMS
`+ ($plugin.settings.vault.value() ? `
    compileOnly("net.milkbowl.vault:VaultAPI:1.7")` : ''
) + `
    compileOnly("me.clip:placeholderapi:2.11.6")`
+ ($other.mythic.value() ? `
    compileOnly("io.lumine:Mythic-Dist:4.13.0")
    compileOnly("io.lumine:Mythic:5.6.2")
    compileOnly("io.lumine:LumineUtils:1.20-SNAPSHOT")` : ''
) + ($other.playerPoints.value() ? `
    compileOnly("org.black_ixx:playerpoints:3.2.7")
` : '') + `
` + ($depend.adventure.value() ? `
    implementation("net.kyori:adventure-api:4.20.0")
    implementation("net.kyori:adventure-platform-bukkit:4.3.4")
    implementation("net.kyori:adventure-text-minimessage:4.20.0")` : ''
) + ($depend.nbtapi.value() ? `
    implementation("de.tr7zw:item-nbt-api:2.15.0")` : ''
) + ($depend.hikariCP.value() ? `
    implementation("com.zaxxer:HikariCP:4.0.3") { isTransitive = false }` : ''
) + `
    // implementation("com.github.technicallycoded:FoliaLib:0.4.4")
    implementation("org.jetbrains:annotations:24.0.0")
    implementation("top.mrxiaom:PluginBase:1.4.0")
}
java {
    val javaVersion = JavaVersion.toVersion(targetJavaVersion)
    if (JavaVersion.current() < javaVersion) {
        toolchain.languageVersion.set(JavaLanguageVersion.of(targetJavaVersion))
    }
}
tasks {
    shadowJar {
        archiveClassifier.set("")
        mapOf(
            "org.intellij.lang.annotations" to "annotations.intellij",
            "org.jetbrains.annotations" to "annotations.jetbrains",
            "top.mrxiaom.pluginbase" to "base",`
+ ($depend.hikariCP.value() ? `
            "com.zaxxer.hikari" to "hikari",` : ''
) + ($depend.nbtapi.value() ? `
            "de.tr7zw.changeme.nbtapi" to "nbtapi",` : ''
) + ($depend.adventure.value() ? `
            "net.kyori" to "kyori",` : ''
) + `
            // "com.tcoded.folialib" to "folialib",
        ).forEach { (original, target) ->
            relocate(original, "$shadowGroup.$target")
        }
    }
    build {
        dependsOn(shadowJar)
    }
    withType<JavaCompile>().configureEach {
        options.encoding = "UTF-8"
        if (targetJavaVersion >= 10 || JavaVersion.current().isJava10Compatible) {
            options.release.set(targetJavaVersion)
        }
    }
    processResources {
        duplicatesStrategy = DuplicatesStrategy.INCLUDE
        from(sourceSets.main.get().resources.srcDirs) {
            expand(mapOf("version" to version))
            include("plugin.yml")
        }
    }
}
publishing {
    publications {
        create<MavenPublication>("maven") {
            from(components.getByName("java"))
            groupId = project.group.toString()
            artifactId = rootProject.name
            version = project.version.toString()
        }
    }
}
`);
    push("gradle/wrapper/gradle-wrapper.properties",
`distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://mirrors.cloud.tencent.com/gradle/gradle-8.5-bin.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`);
    const dependList = [];
    const softDependList = ['PlaceholderAPI'];
    if ($plugin.settings.vault.value())
        dependList.push("Vault");
    if ($other.mythic.value())
        softDependList.push("MythicMobs");
    if ($other.playerPoints.value())
        softDependList.push("PlayerPoints");

    push("src/main/resources/plugin.yml",
`name: ${$plugin.name.value()}
version: '` + '${version}' + `'
main: ${$plugin.package.value()}.${$plugin.mainClass.value()}
api-version: ${$plugin.apiVersion.value()}
depend: [ ${dependList.join(', ')} ]
softdepend: [ ${softDependList.join(', ')} ]
authors: [ ${$plugin.authors.value()} ]`
+ ($command.register.value() ? (`
commands:
  ${$command.name.value()}:
    description: '${$command.description.value()}'`
  + ($command.aliasEnable.value() ? `
    aliases: [ ${$command.alias.value()} ]` : ''
  )) : ''
) + `
`);
    if ($plugin.settings.database.value()) {
        push("src/main/resources/database.yml",
`# 添加 goto 选项，使用指定路径的配置文件作为数据库配置
# 添加后，剩余其它选项可以全部删除
# goto: 'path/to/database.yml'

# 数据库类型，可选 sqlite 与 mysql
type: sqlite
# 表名前缀
table_prefix: '${$plugin.name.value().toLowerCase()}_'
# JDBC 参数
query: 'useSSL=false&allowPublicKeyRetrieval=true&verifyServerCertificate=false&serverTimezone=UTC'
# 连接池设置
hikari:
  max_lifetime: 120000
  idle_timeout: 10000
  connection_timeout: 5000
  minimum_idle: 8
  maximum_pool_size: 36
# MySQL 设置
mysql:
  host: localhost
  port: 3306
  user: 'root'
  pass: 'root'
  database: minecraft
# SQLite 设置
sqlite:
  file: 'database.db'
`);
    }

    const addJavaSourceCode = function(className, content) {
        const i = className.lastIndexOf('.');
        const realPackage = i < 0 ? package : (package + '.' + className.substring(0, i));
        push('src/main/java/' + (package + '.' + className).replaceAll('.', '/') + '.java',
        `package ${realPackage};
        ` + content);
    };

    const mainClass = $plugin.mainClass.value();
    addJavaSourceCode(mainClass,
($plugin.settings.nbtapi.value() ? `
import de.tr7zw.changeme.nbtapi.utils.MinecraftVersion;` : ''
) + `
import top.mrxiaom.pluginbase.BukkitPlugin;`
+ ($plugin.settings.vault.value() ? `
import top.mrxiaom.pluginbase.economy.EnumEconomy;
import top.mrxiaom.pluginbase.economy.IEconomy;
import org.jetbrains.annotations.NotNull;` : ''
) + `

public class ${mainClass} extends BukkitPlugin {
    public static ${mainClass} getInstance() {
        return (${mainClass}) BukkitPlugin.getInstance();
    }

    public ${mainClass}() {
        super(options()
                .bungee(${$plugin.settings.bungeecord.value()})
                .adventure(${$depend.adventure.value()})
                .database(${$plugin.settings.database.value()})
                .reconnectDatabaseWhenReloadConfig(${$plugin.settings.dbReload.value()})`
+ ($plugin.settings.vault.value() ? `
                .economy(EnumEconomy.VAULT)` : ''
) + ($plugin.settings.ignore.value() ? `
                .scanIgnore("${$depend.shadowTarget.value()}")` : ''
) + `
        );
        // this.scheduler = new FoliaLibScheduler(this);
    }`
+ ($plugin.settings.vault.value() ? `
    @NotNull
    public IEconomy getEconomy() {
        return options.economy();
    }` : ''
)
+ ($plugin.settings.nbtapi.value() ? `

    @Override
    protected void beforeLoad() {
        MinecraftVersion.replaceLogger(getLogger());
        MinecraftVersion.disableUpdateCheck();
        MinecraftVersion.disableBStats();
        MinecraftVersion.getVersion();
    }` : ''
) + ($plugin.settings.database.value() ? `

    @Override
    protected void beforeEnable() {
        options.registerDatabase(
                // 在这里添加数据库 (如果需要的话)
        );
    }` : ''
) + `

    @Override
    protected void afterEnable() {
        getLogger().info("${$plugin.name.value()} 加载完毕");
    }
}
`);
    addJavaSourceCode("func.AbstractModule", `
import ${package}.${mainClass};

public abstract class AbstractModule extends top.mrxiaom.pluginbase.func.AbstractModule<${mainClass}> {
    public AbstractModule(${mainClass} plugin) {
        super(plugin);
    }
}
`);
    addJavaSourceCode("func.AbstractPluginHolder", `
import ${package}.${mainClass};

@SuppressWarnings({"unused"})
public abstract class AbstractPluginHolder extends top.mrxiaom.pluginbase.func.AbstractPluginHolder<${mainClass}> {
    public AbstractPluginHolder(${mainClass} plugin) {
        super(plugin);
    }

    public AbstractPluginHolder(${mainClass} plugin, boolean register) {
        super(plugin, register);
    }
}
`);
    if ($command.register.value()) {
        addJavaSourceCode("commands.CommandMain", `
import com.google.common.collect.Lists;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.command.TabCompleter;
import org.bukkit.event.Listener;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import top.mrxiaom.pluginbase.func.AutoRegister;
import ${package}.${mainClass};
import ${package}.func.AbstractModule;

import java.util.*;

@AutoRegister
public class CommandMain extends AbstractModule implements CommandExecutor, TabCompleter, Listener {
    public CommandMain(${mainClass} plugin) {
        super(plugin);
        registerCommand("${$command.name.value()}", this);
    }

    @Override
    public boolean onCommand(@NotNull CommandSender sender, @NotNull Command command, @NotNull String label, @NotNull String[] args) {
        if (args.length == 1 && "hello".equalsIgnoreCase(args[0])) {
            return t(sender, "Hello World!");
        }
        if (args.length == 1 && "reload".equalsIgnoreCase(args[0]) && sender.isOp()) {
            plugin.reloadConfig();
            return t(sender, "&a配置文件已重载");
        }
        return true;
    }

    private static final List<String> emptyList = Lists.newArrayList();
    private static final List<String> listArg0 = Lists.newArrayList(
            "hello");
    private static final List<String> listOpArg0 = Lists.newArrayList(
            "hello", "reload");
    @Nullable
    @Override
    public List<String> onTabComplete(@NotNull CommandSender sender, @NotNull Command command, @NotNull String alias, @NotNull String[] args) {
        if (args.length == 1) {
            return startsWith(sender.isOp() ? listOpArg0 : listArg0, args[0]);
        }
        return emptyList;
    }

    public List<String> startsWith(Collection<String> list, String s) {
        return startsWith(null, list, s);
    }
    public List<String> startsWith(String[] addition, Collection<String> list, String s) {
        String s1 = s.toLowerCase();
        List<String> stringList = new ArrayList<>(list);
        if (addition != null) stringList.addAll(0, Lists.newArrayList(addition));
        stringList.removeIf(it -> !it.toLowerCase().startsWith(s1));
        return stringList;
    }
}
`);
    }
}

$start.onclick = async () => {
    $start.setAttribute("disabled", undefined)
    $startText.innerHTML = "正在生成项目"
    try {
        const pluginName = $plugin.name.value()
        let remotes = [
            { name: "gradle/wrapper/gradle-wrapper.jar", url: "https://bukkit.mcio.dev/assets/project/gradle/wrapper/gradle-wrapper.jar"  },
            { name: "gradlew", url: "https://bukkit.mcio.dev/assets/project/gradlew" },
            { name: "gradlew.bat", url: "https://bukkit.mcio.dev/assets/project/gradlew.bat" },
        ], plains = [
            { name: "settings.gradle.kts", content: "rootProject.name = \"" + pluginName + "\"\n" },
        ]

        generateCode(plains)

        const fileStream = streamSaver.createWriteStream(pluginName + '.zip')
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
