<?php
define( 'CODEPRESS_VERSION', '1.0' );
define( 'CODEPRESS_API_VERSION', 'v1' );

/**
 * Sets up theme defaults and registers support for various WordPress features.
 *
 * Note that this function is hooked into the after_setup_theme hook, which
 * runs before the init hook. The init hook is too late for some features, such
 * as indicating support for post thumbnails.
 */
function codepress_setup() {
	/*
	 * Make theme available for translation.
	 */
	load_theme_textdomain( 'ninethree', get_template_directory() . '/languages' );

	// Add default posts and comments RSS feed links to head.
	add_theme_support( 'automatic-feed-links' );

	/*
	 * Let WordPress manage the document title.
	 * By adding theme support, we declare that this theme does not use a
	 * hard-coded <title> tag in the document head, and expect WordPress to
	 * provide it for us.
	 */
	add_theme_support( 'title-tag' );

	/*
	 * Enable support for Post Thumbnails on posts and pages.
	 *
	 * @link http://codex.wordpress.org/Function_Reference/add_theme_support#Post_Thumbnails
	 */
	add_theme_support( 'post-thumbnails' );

	// This theme uses wp_nav_menu() in one location.
	$menus = array(
		'primary-left' => 'Primary Menu',
		'user-menu' => 'User Menu',
	);

	foreach( $menus as $key => $menu ) {
		register_nav_menus( array(
			$key => esc_html__( $menu, 'ninethree' ),
		) );
	}

	/*
	 * Switch default core markup for search form, comment form, and comments
	 * to output valid HTML5.
	 */
	add_theme_support( 'html5', array(
		'search-form',
		'comment-form',
		'comment-list',
		'gallery',
		'caption',
	) );

	/*
	 * Enable support for Post Formats.
	 * See http://codex.wordpress.org/Post_Formats
	 */
	add_theme_support( 'post-formats', array(
		'aside',
		'image',
		'video',
		'quote',
		'link',
	) );

	// Set up the WordPress core custom background feature.
	add_theme_support( 'custom-background', apply_filters( 'codepress_custom_background_args', array(
		'default-color' => 'ffffff',
		'default-image' => '',
	) ) );

	add_image_size( 'thumbnail', 400, 200, array('left', 'top') );
}
add_action( 'after_setup_theme', 'codepress_setup' );

/**
 * Set the content width in pixels, based on the theme's design and stylesheet.
 *
 * Priority 0 to make it available to lower priority callbacks.
 *
 * @global int $content_width
 */
function codepress_content_width() {
	$GLOBALS['content_width'] = apply_filters( 'codepress_content_width', 798 );
}
add_action( 'after_setup_theme', 'codepress_content_width', 0 );

/**
 * Register widget area.
 *
 * @link http://codex.wordpress.org/Function_Reference/register_sidebar
 */
function codepress_widgets_init() {
	register_sidebar( array(
		'name'          => esc_html__( 'Sidebar', 'ninethree' ),
		'id'            => 'sidebar-1',
		'description'   => '',
		'before_widget' => '<aside id="%1$s" class="widget %2$s">',
		'after_widget'  => '</aside>',
		'before_title'  => '<h2 class="widget-title">',
		'after_title'   => '</h2>',
	) );
}
add_action( 'widgets_init', 'codepress_widgets_init' );

/***
 * Php JWT library
 */
require_once 'lib/php-jwt/JWT.php';

/***
 * Wordpress customisations
 */
require_once 'inc/extra.php';

/***
 * Addons utility functions
 */
require_once 'inc/addons.php';

/***
 * EXTEND RESET API
 */
require_once 'inc/rest.php';

/**
 * Trello API
 */
require 'inc/trello.php';
