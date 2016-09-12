<?php
/**
 * Addons utility functions
 *
 */
 if( ! defined( 'ABSPATH' ) ) die();

/**
 * Add a new "Generator" post, if don't exists.
 * For each addon I need to store its URL, as I need to include the controllers
 * and directives files.
 *
 * @param $title - generator title
 * @param $slug - generator slug
 * @param $file - plugin __FILE__ symlink function. It's used to retrieve the
 *                plugin url and directory.
 *
 */
function cp_register_addon( $title, $file ) {
  global $wpdb;

  $slug = sanitize_title( $title );
  $post_id = $wpdb->get_var( "SELECT ID FROM $wpdb->posts WHERE post_name = '$slug' AND post_type = 'generators'" );

  //The addon data
  $data = get_plugin_data($file);

  $content = preg_replace('/<cite.*/', '', $data['Description']);
  $generator = array(
    'post_title'    => $title,
    'post_status'   => 'publish',
    'post_type'     => 'generators',
    'post_content'       => $content,
  );

  if( $post_id == null ) {
    //Create a new post
    $post_id = wp_insert_post( $generator );
  } else {
    $generator['ID'] = $post_id;
    wp_update_post( $generator );
  }

  // The addon url and path
  $url = plugins_url( '/', $file );
  update_post_meta( $post_id, 'plugin_url', $url );
  update_post_meta( $post_id, 'plugin_folder', basename( dirname( $file ) ) );

  // The addon data
  $data = get_plugin_data($file);
  update_post_meta($post_id, 'plugin_author', $data['AuthorName']);
  update_post_meta($post_id, 'plugin_author_uri', $data['AuthorURI']);
  update_post_meta($post_id, 'plugin_uri', $data['PluginURI']);

  cp_update_addons_list();

  // The addon templates
  /**
   * All the templates create the relative custom post in the ADDON cpt.
   * In order to do that, we parse the [addon]/assets/templates folder and
   * for each php file we create the post. Also each we use the subfolder name
   * for the category one.
   *
   * Example:
   *  templates/core/test.php
   *
   * This will:
   * - create the category "Core" (subfolder)
   * - create a post with the slug "test"
   * - assign the category "core" to the post
   * - read the property Title and Description from the php file, and assign them to the relative fields.
   *
   * So the template PHP file have to match the post slug assigned into WordPress.
   * Also this allow us to automatically created the needed posts without using the dashboard.
   */
  cp_custom_cpt();
  cp_generate_posts_for_addon( $slug, $file );
}

/**
 * Parset the [addon]/assets/templates folder in order to generate the needed
 * categories and posts
 */
function cp_generate_posts_for_addon( $addon_slug, $folder ) {
  $addon_folder = dirname( $folder );
  $addon_taxonomy = "{$addon_slug}-category";

  $templates_folder = trailingslashit( dirname( $folder ) ) . "assets/templates/";

  // Retrieve the html files only...
  $templates = glob( "{$templates_folder}**/*.php" );
  foreach($templates as $template) {
    $dirname = dirname($template);
    $category_slug = str_replace( $templates_folder, '', $dirname );
    $category_name = str_replace( '-', ' ', $category_slug );

    // Add the taxonomy (Generator's category)
    $term = get_term_by( 'slug', $category_slug, $addon_taxonomy );
    if( false === $term ) {
      // The file .category contains info about the current category, like position and icon
      $category_file = $dirname . '/.category';
      if( file_exists( $category_file ) ) {
        $content = file_get_contents( $category_file );
        $category_info = json_decode( $content, true );
      } else {
        $category_info = [];
      }

      // Allow to overwrite the category name
      $name = isset( $category_info['name'] ) ? $category_info['name'] : ucfirst( $category_name );
      $term = wp_insert_term(
        $name,
        $addon_taxonomy,
        [
          'slug' => $category_slug,
          'description' => @$category_info['position'],
        ]
      );

      update_option( 'taxonomy_' . $term['term_id'], [ 'icon' => @$category_info['icon'] ] );
    }

    /**
     * Can't redeclare the same function name, so we using anonymous functions
     * to get the data.
     * http://php.net/manual/en/functions.anonymous.php
     */
    // Add the post
    require_once( $template );
    $post_slug = str_replace( '.fields.php', '', basename( $template ) );
    $data = $fn( '' );

    $title = isset( $data['title'] ) ? $data['title'] : (  ucfirst(str_replace('-', ' ', $post_slug ) ) );
    $description = $data['description'];

    $exists = post_exists( $title );
    $post = array(
      'post_title'    => wp_strip_all_tags( $title ),
      'post_content'  => $description,
      'post_status'   => 'publish',
      'post_author'   => 1,
      'post_name'     => $post_slug,
      'post_type'     => $addon_slug,
      // 'tax_input'     => [
      //   $addon_taxonomy => $category_name,
      // ],
    );

    if( $exists === 0 ) {
      // Insert the post into the database
      $post_id = wp_insert_post( $post );
    } else {
      $post['ID'] = $exists;

      $post_id = wp_update_post( $post );
    }

    wp_set_object_terms( $post_id, $category_name, $addon_taxonomy );
  }
}

/**
 * Bin the post, so will not be no longer "visible/enabled"
 */
function cp_unregister_addon( $title ) {
  global $wpdb;

  $slug = sanitize_title( $title );
  $post_id = $wpdb->get_var( "SELECT ID FROM $wpdb->posts WHERE post_name = '$slug' AND post_type = 'generators'" );

  if( $post_id ) {
    wp_trash_post( $post_id );
  }

  cp_update_addons_list();
}

/**
 * Update the list of active addons.
 *
 * Retrieve all the active generators and save their information, such as name,
 * slug, url and plugin folder, inside the option table.
 * The option is loaded and passed to the front-end using the wp_localize_script
 * function.
 */
function cp_update_addons_list() {
  $args = array(
    'post_type' => 'generators',
    'posts_per_page' => -1,
    'post_status' => 'publish'
  );
  $bp = get_posts( $args );

  $active = array();
  foreach( $bp as $b ) {
    $active[ $b->post_name ] = array(
      'name' => $b->post_title,
      'slug' => $b->post_name,
      'url' => get_post_meta( $b->ID, 'plugin_url', true ),
      'folder' => get_post_meta( $b->ID, 'plugin_folder', true ),
    );
  }

  update_option( 'codepress_addons', $active );
}
