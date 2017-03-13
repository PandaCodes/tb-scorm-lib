const gulp = require('gulp');
const babel = require('gulp-babel');

gulp.task('default', ['watch-player']);



gulp.task('watch-player', () => gulp.watch('src/player/*.js', ['compile-player']));
gulp.task('watch-api', () => gulp.watch('src/api/*.js', ['compile-api']));

gulp.task('compile-api', () => 
  gulp.src('src/api/scorm-api.js')
    .pipe(babel())
    .on('error', console.error.bind(console))
    .pipe(gulp.dest('dist'))
);
gulp.task('compile-player', () => 
  gulp.src('src/player/scorm-player.js')
    .pipe(babel())
    .on('error', console.error.bind(console))
    .pipe(gulp.dest('dist'))
);

