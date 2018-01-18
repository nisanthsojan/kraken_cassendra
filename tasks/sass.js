'use strict';


module.exports = function sass(grunt) {
    // Load task
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-postcss');

    // Options
    return {
        build: {
            options: {
                outputStyle: 'expanded'
            },
            cwd: 'public/css',
            src: '**/*.scss',
            dest: '.build/css/',
            expand: true,
            ext: '.css'
        },
        postcss: {
            options: {
                map: true,
                processors: [
                    require('autoprefixer')
                ]
            },
            dist: {
                src: '.build/css/*.css'
            }
        }
    };
};
