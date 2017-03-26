const gulp = require('gulp');
const shell = require('gulp-shell');

gulp.task('default', ['compile']);


gulp.task('watch', ['watch-api', 'watch-player']);
gulp.task('watch-player', () => gulp.watch('src/player/*.js', ['compile']));
gulp.task('watch-api', () => gulp.watch('src/api/*.js', ['compile']));

gulp.task('compile', shell.task(['npm run compile']));

/*gulp.task('compile-api', () => 
  gulp.src('src/api/scorm-api.js')
    .pipe(webpack(require("./webpack.config.js")))
    .on('error', console.error.bind(console))
    .pipe(gulp.dest('dist'))
);
gulp.task('compile-player', () => 
  gulp.src('src/player/scorm-player.js')
    .pipe(webpack())
    .on('error', console.error.bind(console))
    .pipe(gulp.dest('dist'))
);

*/