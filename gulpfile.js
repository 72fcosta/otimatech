var autoprefixer            = require("autoprefixer");
var browserSync             = require("browser-sync").create();
var del                     = require("del");
var gulp                    = require("gulp");
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
var replace                 = require("gulp-replace");//jekyll
var sourcemaps              = require("gulp-sourcemaps");
var stylus                  = require("gulp-stylus");
var versionAppend           = require("gulp-version-append");
var lost                    = require("lost");
var rsync                   = require("rsyncwrapper");
var runSequence             = require("run-sequence");
var rupture                 = require("rupture");

//--------------------------------------------------------------

var fs                      = require("fs");
var varsProject             = JSON.parse(fs.readFileSync("./vars-project.json"));
var dominio                 = varsProject.dominio;
var regexp                  = new RegExp("https://" + dominio, "g");//jekyll
var options                 = { }; //webfonts

//--------------------------------------------------------------

gulp.task("font-del", function() {
    del("assets/fonts");
});

gulp.task("fontawesome", function() {
    rsync({
        src: "_src/third/fontawesome/font*.*",
        dest: "assets/fonts",
        recursive: true,
        exclude: ["*.css"],
        args: [ "--verbose" ],
        delete: true,
        compareMode: "checksum",
        onStdout: function (data) {
            console.log(data.toString());
        }
    }, function() {
        console.log("End");
    });
});

gulp.task("webfonts", ["font-del"], function () {
    return gulp.src("_src/fonts/fonts.list")
        .pipe(googleWebFonts(options))
        .pipe(gulp.dest("assets/fonts"))
        ;
});

//--------------------------------------------------------------

gulp.task("third-css", function () {
    return gulp.src("_src/third/**/*.css")
        .pipe(concatCss("third.css"))
        .pipe(gulp.dest("_site/assets/css/"))
        .pipe(gulp.dest("assets/css/"));
});

gulp.task("third-js", function () {
    return gulp.src("_src/third/**/*.js")
        .pipe(concatJs("third.js"))
        .pipe(gulp.dest("assets/js/"));
});

//--------------------------------------------------------------

gulp.task("replace-url-in", function() {
    return gulp.src("_config.yml")
        .pipe(replace(/http:\/\/localhost:3000/g, "https://" + dominio))
        .pipe(gulp.dest(""));
});

gulp.task("replace-url-out", function() {
    return gulp.src("_config.yml")
        .pipe(replace(regexp, "http://localhost:3000"))
        .pipe(gulp.dest(""));
});

//--------------------------------------------------------------

gulp.task("jekyll-build", function (done) {
    browserSync.notify("Building Jekyll");
    return cp.spawn("jekyll", ["build"], {stdio: "inherit"})
        .on("close", done);
});

gulp.task("jekyll-rebuild", ["jekyll-build"], function () {
    browserSync.reload();
});

gulp.task("browserSync-reload", function () {
    browserSync.reload();
});

//--------------------------------------------------------------

gulp.task("browser-sync", ["jekyll-build"], function() {
    browserSync.init({
        server: {
            baseDir: "_site"
        }
    });
});

//--------------------------------------------------------------

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
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("_site/assets/css/"))
    .pipe(gulp.dest("assets/css/"))
    .pipe(browserSync.stream());
});

//--------------------------------------------------------------

gulp.task("timestamp", function () {
    return gulp.src("_site/*.html")
        .pipe(versionAppend(["html", "js", "css"], {appendType: "timestamp"}))
        .pipe(gulp.dest("./_site/"));
});

//--------------------------------------------------------------

gulp.task("js", function() {
    rsync({
        src: "_src/js/script.js",
        dest: "assets/js/script.js",
        recursive: true,
        args: [ "--verbose" ],
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

gulp.task("clean", function() {
    return del(["assets/img/"]);
});

gulp.task("image", ["clean"], function() {
    return gulp.src("_src/img/*")
    .pipe(imagemin())
    .pipe(gulp.dest("assets/img/"));
});

//--------------------------------------------------------------

gulp.task("favicon", function() {
    rsync({
        src: "_src/favicon/",
        dest: "assets/favicon",
        recursive: true,
        args: [ "--verbose" ],
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
        args: [ "--verbose" ],
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
    gulp.watch(["_src/fonts/fonts.list"], ["webfonts"]).on("change", browserSync.reload);
    gulp.watch("_src/third/**/*.css", ["third-css", "jekyll-rebuild"]);
    gulp.watch("_src/third/**/*.js", ["third-js", "jekyll-rebuild"]);
    gulp.watch("_src/img/**/*", ["image", "jekyll-rebuild"]);
    gulp.watch("_posts/**/*", ["jekyll-rebuild"]);
    gulp.watch("_src/third/fontawesome/*", ["fontawesome"]);
    gulp.watch("_src/favicon/*", ["favicon"]);
    gulp.watch("_src/js/*.js", ["js", "jekyll-rebuild"]);
    gulp.watch("_src/styl/**/*.styl", ["stylus"]);
    gulp.watch(["*.html", "_includes/**/*.html", "_layouts/*.html", "_config.yml"], ["jekyll-rebuild"]);
});

//--------------------------------------------------------------

//F6
gulp.task("reconstruir", function(callback) {
    runSequence(
        "webfonts",
        "third-css",
        "third-js",
        "image",
        "js",
        "fontawesome",
        "stylus",
        "jekyll-build",
        "timestamp",
        "browserSync-reload",
        callback
        );
});

//F7
gulp.task("deploy", function(callback) {
    runSequence(
        "git-add",
        "git-commit",
        "git-push",
        "replace-url-in",
        "jekyll-build",
        "timestamp",
        "linode",
        "replace-url-out",
        callback
        );
});

//F9
gulp.task("letscode", function(callback) {
    runSequence(
        "third-css",
        "third-js",
        "favicon",
        "fontawesome",
        "js",
        "stylus",
        "browser-sync",
        "watch",
        callback
        );
});
