<?php
define( 'COUNTER_TESTING', '_testing' );
define( 'COUNTER_CLIPBOARD', 'clipboard' );
define( 'COUNTER_SENDTO', 'sendto' );

/**
 * Enqueue scripts and styles.
 *
 * In development environment we use unminified css/javascript.
 */
function codepress_scripts() {
	// wp_enqueue_style( 'angular-material', get_template_directory_uri() . '/node_modules/angular-material/angular-material.min.css' );
	wp_enqueue_style( 'style', get_template_directory_uri() . '/app/dist/app.css' );

	/**
	 * This var contains the url of the active addons.
	 * And will be used to set the 'url' key for the localized $app variable
	 */
	$addons = get_option( 'codepress_addons', array() );
	$_addons_url = array();
	foreach( $addons as $cp ) {
		$_addons_url[ $cp['slug'] ] = $cp['url' ];
	}

	$app = array(
		'home' => home_url(),
		'assets' => get_template_directory_uri() . '/assets/',
		// 'assets-url' => get_template_directory_uri() . '/assets/',
		'views' => get_template_directory_uri() . '/views/',
		'root' => get_template_directory_uri(),
		'addon' => $_addons_url,
		'version' => CODEPRESS_VERSION,
		'api' => home_url( '/api/' ) . CODEPRESS_API_VERSION
	);

	$min = file_exists(get_template_directory() . '/.env') ? '' : '.min';
	wp_register_script( 'bundle', get_template_directory_uri() . "/app/dist/app.bundle${min}.js", [], '1.0', true );
	wp_localize_script( 'bundle', 'codepress', $app );
	wp_enqueue_script( 'bundle', 'codepress', $app );

	//Enqueue the addons route and controller files
	foreach( $addons as $addon ) {
		/**
		 * Add the plugin folder to the javascript boilergen variable
		 */
		$url = $addon['url'];
		wp_enqueue_script( $addon['name'] . '-route', $url . "assets/js/bundle.min.js", array( 'bundle' ), '1.0', true );
		// wp_enqueue_script( $addon['name'] . '-controllers', $url . "assets/js/src/controllers.js", array( 'bundle' ), '1.0', true );
	}

	// Load Fonts
	wp_enqueue_style( 'source-sans-pro', 'https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,300,600' );
	wp_enqueue_style( 'roboto', 'https://fonts.googleapis.com/css?family=Roboto:400,700,300' );
}
add_action( 'wp_enqueue_scripts', 'codepress_scripts' );

/**
 * Register Custom Generators post type
 */
function cp_custom_cpt() {
	/*
	 * generators can't be added manually, but only from the addons
	 */
	$capabilities = array(
    'create_posts' => 'create_boilerplate',
    'edit_post' => 'edit_post',
    'edit_posts' => 'edit_posts',
    'edit_other_posts' => 'edit_other_posts',
    'delete_post' => 'delete_post',
    'delete_posts' => 'delete_posts',
    'read' => 'read',
  );

  $args = array(
    'public' => true,
    'show_in_rest' => true,
		'menu_icon' => 'dashicons-editor-code',
    'rewrite' => array( 'feeds' => true ),
    'supports' => array( 'title', 'editor', 'author', 'thumbnail', 'revisions' ),
    'label' => 'Generators',
		// 'capabilities' => $capabilities,
  );

  register_post_type( 'generators', $args );


	/**
	 * CodePress homepage & documentation
	 *
	 */
  $args = array(
      'label' => __( 'CodePress Tags', 'my-textdomain' ),
      'public' => true,
      'query_var' => false,
      'rewrite' => false,
			'hierarchical' => true,
  );

  register_taxonomy( 'codepress', 'codepress', $args );

  $args = array(
      'public'                => true,
      'show_in_rest'          => true,
			'taxonomies'            => array( 'codepress' ),
      'label'                 => 'CodePress',
			'menu_icon'             => 'dashicons-format-aside',
			'supports'              => array( 'title', 'editor', 'page-attributes' ),
  );

  register_post_type( 'codepress', $args );

	/**
	 * For each generator item I'm gonna create a custom post type.
	 */
	 $active = get_option( 'codepress_addons', array() );

	 foreach( $active as $cp ) {
		//  register a custom taxonomy for each of them
		register_taxonomy(
			$cp['slug'] . '-category',
			$cp['slug'],
			array(
				'label' => 'Categories',
				'rewrite' => array( 'slug' => $cp['slug'] ),
				'hierarchical' => true,
				'show_in_rest' => true,
			)
		);

		$args = array(
		 'public' => true,
		 'hierarchical' => true,
		 'show_in_rest' => true,
		 'rewrite' => array( 'feeds' => true ),
		 'supports' => array( 'title', 'editor', 'author', 'thumbnail', 'revisions', 'custom-fields' ),
		 'label' => $cp['name'],
		 /*
		  * Use the description field as endpoint "parent".
			* So the "addon" endpoint will be: /generators/[slug]
			*/
		 'description' => 'generators',
		);

		register_post_type( $cp['name'], $args );

		//Custom taxonomy icon
		add_action( $cp['slug'] . '-category_add_form_fields', 'codepress_taxonomy_add_icon_field' );
		add_action( $cp['slug'] . '-category_edit_form_fields', 'codepress_taxonomy_edit_icon_field', 10, 2 );

		add_action( 'edited_' . $cp['slug'] . '-category', 'codepress_save_taxonomy_custom_meta', 10, 2 );
		add_action( 'create_' . $cp['slug'] . '-category', 'codepress_save_taxonomy_custom_meta', 10, 2 );

	}
}

add_action( 'init', 'cp_custom_cpt' );

/**
 * Allow users to login by email
 *
 */
add_filter('authenticate', function($user, $email, $password){
  error_log( "Email:" . $email );
 //Check for empty fields
 if(empty($email) || empty ($password)){
     //create new error object and add errors to it.
     $error = new WP_Error();

     if(empty($email)){ //No email
         $error->add('empty_username', __('<strong>ERROR</strong>: Email field is empty.'));
     }
     else if(!filter_var($email, FILTER_VALIDATE_EMAIL)){ //Invalid Email
         $error->add('invalid_username', __('<strong>ERROR</strong>: Email is invalid.'));
     }

     if(empty($password)){ //No password
         $error->add('empty_password', __('<strong>ERROR</strong>: Password field is empty.'));
     }

     return $error;
 }

 //Check if user exists in WordPress database
 $user = get_user_by('email', $email);

 //bad email
 if(!$user){
     $error = new WP_Error();
     $error->add('invalid', __('<strong>ERROR</strong>: Either the email or password you entered is invalid.'));
     return $error;
 }
 else{ //check password
     if(!wp_check_password($password, $user->user_pass, $user->ID)){ //bad password
         $error = new WP_Error();
         $error->add('invalid', __('<strong>ERROR</strong>: Either the email or password you entered is invalid.'));
         return $error;
     }else{
         return $user; //passed
     }
 }
}, 20, 3);

/**
 * Add custom "icon" field for taxonomies.
 *
 * The icon is used for the front-end
 */
function codepress_taxonomy_add_icon_field() { ?>
 	<div class="form-field">
 		<label for="term_meta[custom_term_meta]"><?php _e( 'Material design icon name', 'codepress' ); ?></label>
 		<input type="text" name="term_meta[icon]" id="term_meta[icon]" value="">
 		<p class="description"><?php _e( 'For the full list, please refer to: ','codepress' ); ?><a href="https://klarsys.github.io/angular-material-icons/" target="_blank">Angular Material Icons</a></p>
 	</div>
 <?php
}

function codepress_taxonomy_edit_icon_field( $term ) {
	// put the term ID into a variable
	$t_id = $term->term_id;

	// retrieve the existing value(s) for this meta field. This returns an array
	$term_meta = get_option( "taxonomy_{$t_id}" );
?>
	<tr class="form-field">
	<th scope="row" valign="top"><label for="term_meta[icon]"><?php _e( 'Icon name', 'codepress' ); ?></label></th>
		<td>
			<input type="text" name="term_meta[icon]" id="term_meta[icon]" value="<?php echo esc_attr( $term_meta['icon'] ) ? esc_attr( $term_meta['icon'] ) : ''; ?>">
			<p class="description"><?php _e( 'For the full list, please refer to: ','pippin' ); ?><a href="https://klarsys.github.io/angular-material-icons/" target="_blank">Angular Material Icons</a></p>
		</td>
	</tr>
<?php }

// Save extra taxonomy fields callback function.
function codepress_save_taxonomy_custom_meta( $term_id ) {
	if ( isset( $_POST['term_meta'] ) ) {
		$t_id = $term_id;
		$term_meta = get_option( "taxonomy_$t_id" );
		$cat_keys = array_keys( $_POST['term_meta'] );
		foreach ( $cat_keys as $key ) {
			if ( isset ( $_POST['term_meta'][$key] ) ) {
				$term_meta[$key] = $_POST['term_meta'][$key];
			}
		}

		// Save the option array.
		update_option( "taxonomy_{$t_id}", $term_meta );
	}
}

/**
 * For statistics purpose I want keep track on how many users use the service
 * to generate the code.
 * The routine doesn't store any user info, just increment a counter.
 *
 * We have 2 different counters:
 *	2) clipboard - How many times user clicked on "COPY". This action is counted only once, for eacn page load
 *	3) sendto - How many time user sent code to his/her "editor"...
 *
 * For comodity, and to avoid misspells, the key are stored as constants
 *
 * @param {String} Action (Clipboard/sendto);
 * @param {String} generator slug
 * @param {String} wordpress page ID
 */
function codepress_increment_counter( $action, $slug, $pageID ) {
	global $wpdb;

	$counter = $wpdb->get_row( $wpdb->prepare(
		"SELECT id, count FROM cp_counters WHERE action = '%s' AND generator = '%s' AND templateID = %d",
		$action,
		$slug,
		$pageID
	) );

	if( $counter === null ) {
		$wpdb->insert(
			'cp_counters',
			[
				'action' => $action,
				'generator' => $slug,
				'templateID' => $pageID,
				'count' => 1,
			],
			[
				'%s',
				'%s',
				'%d',
				'%d',
			]
		);
	} else {
		$wpdb->update(
			'cp_counters',
			[
				'count' => $counter->count + 1,
			],
			[
				'id' => $counter->id,
			],
			[
				'%d',
			],
			[
				'%d',
			]
		);
	}
}

/**
 * Disable the emoji
 *
 */
function cp_disable_wp_emojicons() {
 // all actions related to emojis
 remove_action( 'admin_print_styles', 'print_emoji_styles' );
 remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
 remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
 remove_action( 'wp_print_styles', 'print_emoji_styles' );
 remove_filter( 'wp_mail', 'wp_staticize_emoji_for_email' );
 remove_filter( 'the_content_feed', 'wp_staticize_emoji' );
 remove_filter( 'comment_text_rss', 'wp_staticize_emoji' );

 // filter to remove TinyMCE emojis
 add_filter( 'tiny_mce_plugins', 'disable_emojicons_tinymce' );
}
add_action( 'init', 'cp_disable_wp_emojicons' );

/**
 * Disable wp_oembed
 */
function disable_embeds_init() {
 // Remove the REST API endpoint.
 remove_action('rest_api_init', 'wp_oembed_register_route');

 // Turn off oEmbed auto discovery.
 // Don't filter oEmbed results.
 remove_filter('oembed_dataparse', 'wp_filter_oembed_result', 10);

 // Remove oEmbed discovery links.
 remove_action('wp_head', 'wp_oembed_add_discovery_links');

 // Remove oEmbed-specific JavaScript from the front-end and back-end.
 remove_action('wp_head', 'wp_oembed_add_host_js');
}

add_action('init', 'disable_embeds_init', 9999);
