var autoprefixer            = require("autoprefixer");
var browserSync             = require("browser-sync").create();
var del                     = require("del");
var gulp                    = require("gulp");
var cleanCSS                = require("gulp-clean-css");
var concatJs                = require("gulp-concat");
var concatCss               = require("gulp-concat-css");
var git                     = require("gulp-git");
var googleWebFonts          = require("gulp-google-webfonts");
var cp                      = require("child_process");//jekyll
var imagemin                = require("gulp-imagemin");
//gulp-notify require sudo apt-get install libnotify-bin notify-osd no Lubuntu
var notify                  = require("gulp-notify");
var plumber                 = require("gulp-plumber");
var postcss                 = require("gulp-postcss");
var shell                   = require("gulp-shell");
var sourcemaps              = require("gulp-sourcemaps");
var stylus                  = require("gulp-stylus");
var lost                    = require("lost");
var rsync                   = require("rsyncwrapper");
var runSequence             = require("run-sequence");
var rupture                 = require("rupture");

//--------------------------------------------------------------

var fs                      = require("fs");
var varsProject             = JSON.parse(fs.readFileSync("./vars-project.json"));
var dominio                 = varsProject.dominio;
var url                     = "https://" + varsProject.dominio;
var diplenick               = varsProject.diplenick;
var options                 = { }; //webfonts

//---------------------------------------------------------FONTS

gulp.task("fonts", function(callback) {
    runSequence(
        "font-del",
        "webfonts",
        callback
        )
});

gulp.task("font-del", function() {
    del("fonts")
});

gulp.task("webfonts", function () {
    return gulp.src("fonts.list")
    .pipe(googleWebFonts(options))
    .pipe(gulp.dest("fonts"))
});

//--------------------------------------------------------------

gulp.task("replace-in", shell.task(
    "python3.5 -c \'from dpn_gulp import jk_replace_lines_in; jk_replace_lines_in(\"" + diplenick + "\", \"" + url + "\")\'"
));

gulp.task("replace-out", shell.task(
    "python3.5 -c \'from dpn_gulp import jk_replace_lines_out; jk_replace_lines_out(\"" + diplenick + "\", \"" + url + "\")\'"
));

//-----------------------------------------------------------CSS

gulp.task("stylus", function() {
    return gulp.src("_src/styl/style.styl")
    .pipe(plumber({errorHandler: notify.onError({
        message: "Error: <%= error.message %>",
        title: "Erro na tarefa Stylus"
    })}))
    .pipe(sourcemaps.init())
    .pipe(stylus({
        use:[rupture()],
    }))
    .pipe(postcss([
        lost(),
        autoprefixer()
        ]))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("_site/assets/css/"))
    .pipe(browserSync.stream())
    .pipe(gulp.dest("assets/css/"))
});

gulp.task("third-css", function() {
    return gulp.src("_src/third/**/*.css")
    .pipe(concatCss("third.css"))
    .pipe(gulp.dest("assets/css/"))
});

gulp.task("min-css", function() {
    return gulp.src("_site/assets/css/*.css")
    .pipe(cleanCSS())
    .pipe(gulp.dest("_site/assets/css/"))
});

//------------------------------------------------------------JS

gulp.task("js", function() {
    rsync({
        src: "_src/js/script.js",
        dest: "assets/js/script.js",
        recursive: true,
        args: [ "-v" ],
        delete: true,
        compareMode: "checksum",
        onStdout: function (data) {
            console.log(data.toString());
        }
    }, function() {
        console.log("End")
    });
});

gulp.task("third-js", function() {
    return gulp.src("_src/third/**/*.js")
    .pipe(concatJs("third.js"))
    .pipe(gulp.dest("assets/js/"))
});

//--------------------------------------------------------------

gulp.task("jekyll-build", function(done) {
    browserSync.notify("Building Jekyll");
    return cp.spawn("jekyll", ["build"], {stdio: "inherit"})
        .on("close", done)
});

gulp.task("jekyll-rebuild", ["jekyll-build"], function() {
    browserSync.reload()
});

//--------------------------------------------------------------

gulp.task("browser-sync", ["jekyll-build"], function() {
    browserSync.init({
        server: {
            baseDir: "_site"
        },
        open: false
    });
});

gulp.task("browserSync-reload", function() {
    browserSync.reload()
});

//--------------------------------------------------------------

gulp.task("sync-favicon", function() {
    rsync({
        src: ["_src/favicon/"],
        dest: "assets/favicon/",
        recursive: true,
        args: ["-v"],
        delete: true,
        compareMode: "checksum",
        onStdout: function (data) {
            console.log(data.toString());
        }
    }, function() {
        console.log("End");
    });
});

gulp.task("sync-img", function() {
    rsync({
        src: ["_src/img"],
        dest: "assets/",
        recursive: true,
        args: ["-v"],
        delete: true,
        compareMode: "checksum",
        onStdout: function (data) {
            console.log(data.toString());
        }
    }, function() {
        console.log("End");
    });
});

gulp.task("min-image", function() {
    return gulp.src("_src/img/*.*")
    .pipe(imagemin())
    .pipe(gulp.dest("assets/img/"))
});

//--------------------------------------------------------------

gulp.task("git-add", function() {
    return gulp.src("./")
    .pipe(git.add({args: "-A"}));
});

gulp.task("git-commit", function() {
    return gulp.src("./")
    .pipe(git.commit("Commit"));
});

gulp.task("git-push", function() {
    git.push("origin", "master", function (err) {
        if (err) throw err;
    });
});

//--------------------------------------------------------------

gulp.task("linode", function() {
    rsync({
        src: "./_site/",
        dest: "diple@45.33.23.219:/var/www/html/" + dominio,
        ssh: true,
        recursive: true,
        exclude: [".htaccess", "gulpfile.js", "config", "description", "HEAD", "hooks", "tarefas-do-projeto.txt"],
        args: ["-v"],
        delete: true,
        compareMode: "checksum",
        onStdout: function (data) {
            console.log(data.toString());
        }
    }, function() {
        console.log("End");
    });
});

//--------------------------------------------------------------

gulp.task("watch", function () {
    gulp.watch(["*.html", "_includes/**/*.html", "_layouts/*.html", "_config.yml", "_data/*.yml", "_posts/**/*"], ["jekyll-rebuild"]);
    gulp.watch(["_src/styl/**/*.styl"], ["stylus"]);
    gulp.watch(["_src/third/**/*.css"], ["third-css", "jekyll-rebuild"]);
    gulp.watch(["_src/js/*.js"], ["js", "jekyll-rebuild"]);
    gulp.watch(["_src/third/**/*.js"], ["third-js", "jekyll-rebuild"]);
    gulp.watch(["_src/favicon/*"], ["sync-favicon", "jekyll-rebuild"]);
    gulp.watch(["_src/img/**/*"], ["sync-img", "jekyll-rebuild"]);
    gulp.watch(["fonts.list"], ["fonts", "jekyll-rebuild"]);
});

//--------------------------------------------------------------

//F6
gulp.task("reconstruir", function(callback) {
    runSequence(
        "stylus",
        "third-css",
        "js",
        "third-js",
        "sync-favicon",
        "sync-img",
        "fonts",
        "jekyll-build",
        "browserSync-reload",
        callback
        );
});

//F7
gulp.task("deploy", function(callback) {
    runSequence(
        "replace-in",
        "git-add",
        "git-commit",
        "git-push",
        "jekyll-build",
        "min-css",
        "min-image",
        "linode",
        "replace-out",
        callback
        );
});

//F9
gulp.task("letscode", function(callback) {
    runSequence(
        "browser-sync",
        "watch",
        callback
        );
});
