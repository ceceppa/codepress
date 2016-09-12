<?php
use \Firebase\JWT\JWT;

require_once dirname(__FILE__) . '/../lib/php-jwt/SignatureInvalidException.php';
require_once dirname(__FILE__) . '/../lib/php-jwt/BeforeValidException.php';
require_once dirname(__FILE__) . '/../lib/php-jwt/ExpiredException.php';

if( ! defined( 'ABSPATH' ) ) die();

/**
 * codepress.io REST API.
 *
 * The following code is used to extend the WordPress REST API, by adding
 * custom endpoint and fields.
 */
// class CodePress_Rest_Controller extends WP_REST_Controller {
class CodePress_Rest_Controller {
  protected $namespace = 'v1';

  /**
   * Register the routes for the objects of the controller.
   *
   * New endpoints:
   *   /auth/ - used to authenticate the user by email and password
   *   /auth/[TOKEN] - validate the user token
   *   /generators     - retrieve the list of the available generators
   *   /codepress     - codepress documentation
   *   /generators/[GENERATOR] - generator's addon
   *  /sendto/[CODE] - store/retrieve the code into the DB. When using PUT return the associated key, while GET return it.
   *
   * New fields:
   *  thumbnail - Return the generators thumbnail, in order to avoid making another ajax call to get it.
   *  icon      - retrieve the generator category's icon name.
   */
  public function register_routes() {
    /**
     * User authentication endpoint
     *
     * Usage: /auth/?email=[email]&password=[password]
     */
    register_rest_route( $this->namespace, '/auth/', array(
      array(
        'methods'         => array( 'POST' ),
        'callback'        => array( & $this, 'authenticate' ),
        'args'            => $this->get_collection_params( 'auth_post' ),
      ),
    ) );

    register_rest_route( $this->namespace, '/auth/(?P<token>.*)', array(
      array(
        'methods'         => WP_REST_Server::READABLE,
        'callback'        => array( & $this, 'validate_token' ),
        'args'            => $this->get_collection_params( 'auth' ),
      ),
    ) );

    /**
     * Register the endpoint for the generators and the custom templates
     *
     * Don't want to use the WP REST API WP_REST_Posts_Controller class, as
     * need only to expose the GET method.
     * So, I'm gonna create custom endpoint for the post types created by me
     */
    foreach ( get_post_types( array( 'show_in_rest' => true ), 'objects' ) as $post_type ) {
      $slug = $post_type->name;
      if( $post_type->description != '' ) $slug = $post_type->description . '/' . $slug;

      register_rest_route( $this->namespace, '/' . $slug, array(
        array(
          'methods'         => WP_REST_Server::READABLE,
          'callback'        => array( & $this, 'get_post_type' ),
        ),
      ) );
    }

    /**
     * Custom endpoint to get the generators' items
     *
     * The endpoint return the list of posts sorted by category.
     *
     * Usage: /templates/[generator-slug]
     */
    register_rest_route( $this->namespace, '/templates/(?P<slug>\w+)', array(
      array(
        'methods'         => WP_REST_Server::READABLE,
        'callback'        => array( & $this, 'get_generator_templates' ),
        'args'            => $this->get_collection_params( 'templates' ),
      ),
    ) );


    /**
     * Roadmap endpoint
     *
     * The roadmap is managed in a trello board.
     *
     * Usage: /roadmap
     */
    register_rest_route( $this->namespace, '/roadmap', array(
      array(
        'methods'         => WP_REST_Server::READABLE,
        'callback'        => array( & $this, 'get_roadmap' ),
      ),
    ) );

    /**
     * Add the thumbnail as a json field, to avoid another GET call
     */
    register_rest_field( 'generators',
        'thumbnail',
        array(
            'get_callback'    => array( & $this, 'get_thumbnail' ),
            'update_callback' => null,
            'schema'          => null,
        )
    );

    /**
     * Send code to...
     *
     * Usage: /sendto/[code]
     */
    register_rest_route( $this->namespace, '/sendto/', array(
      array(
        'methods'         => array( WP_REST_Server::READABLE, 'POST' ),
        'callback'        => array( & $this, 'send_code_to' ),
        'args'            => $this->get_collection_params(),
      ),
    ) );

    /**
     * Get counter...
     *
     * Usage: /counter
     */
    register_rest_route( $this->namespace, '/counter/', array(
      array(
        'methods'         => array( WP_REST_Server::READABLE, 'POST' ),
        'callback'        => array( & $this, 'get_update_counter' ),
        'args'            => $this->get_collection_params(),
      ),
    ) );

    /**
     * Each addon can return different fields, so as I can't register dynamic rest
     * field, I'm gonna register a dynamic rest endpoint.
     * So, the get_template function will return the post data, plus all the
     * information needed for the template to be rendered properly.
     *
     * For example /template/wordpress/[template-slug]
     */
    register_rest_route( $this->namespace, '/template/(?P<template>\w[^\/]*)/(?P<slug>\w.*)', array(
     array(
       'methods'         => WP_REST_Server::READABLE,
       'callback'        => array( & $this, 'get_template' ),
       'args'            => $this->get_collection_params(),
     ),
    ) );
    register_rest_route( $this->namespace, '/codepress/(?P<slug>\w.*)', array(
     array(
       'methods'         => WP_REST_Server::READABLE,
       'callback'        => array( & $this, 'get_codepress_page' ),
       'args'            => $this->get_collection_params(),
     ),
    ) );
  }

  /**
   * Authenticate user mail and password, if succeed return the JWT
   *
   */
  function authenticate( $request ) {
    $email = $request['email'];
    $password = $request['password'];

    $creds = array();
  	$creds['user_login'] = $email;
  	$creds['user_password'] = $password;
  	$creds['remember'] = true;
  	$user = wp_signon( $creds, false );

  	if ( is_wp_error($user) ) {
  		return new WP_Error( 'authentication_failed', __( 'Invalid username or password' ), array( 'status' => 401 ) );
    }

    $time = time();
    $user_info = get_userdata( $user->ID );

    $token = [
      'iss' => home_url(),
      'aud' => home_url(),
      'iat' => $time,
      'nbf' => $time + 10,
      'exp' => $time + 60 * 60 * 24 * 30,
      'jti' => base64_encode(uniqid()),
      'data' => [
        'id' => $user->ID,
        'email' => $email
      ]
    ];

    $jwt = JWT::encode( $token, AUTH_KEY );

    return [
      'token' => $jwt,
      'user' => [
        'id' => $user->ID,
        'email' => $email,
        'name' => $user_info->first_name,
        'last_name' => $user_info->last_name,
      ]
    ];
  }

  /**
   * Validate the user token, and log it in if succeed.
   *
   */
  function validate_token( $request ) {
    $token = $request['token'];

    try {
      $decoded = JWT::decode($token, AUTH_KEY, array('HS256'));
    } catch( Exception $e ) {
      //Invalid token
      return new WP_Error( 'authentication_failed', __( 'Invalid token' ), array( 'status' => 401 ) );
    }

    //The token is valid, let's sign on the user
    $user = get_user_by( 'id', $decoded->data->id );

    // Redirect URL //
    if ( is_wp_error( $user ) ) {
      return new WP_Error( 'authentication_failed', __( 'Invalid token' ), array( 'status' => 401 ) );
    } else {
      wp_clear_auth_cookie();
      wp_set_current_user ( $user->ID );
      wp_set_auth_cookie  ( $user->ID );
    }

    return [
      'token' => $token,
      'user' => [
        'id' => $user->ID,
        'email' => $user->user_email,
        'name' => $user->first_name,
        'last_name' => $user->last_name,
      ]
    ];
  }

  /**
	 * This is a convenient function that return the addon templates grouped
   * and sorted by category and title
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return WP_Error|WP_REST_Response
	 */
	public function get_generator_templates( $request ) {
    global $wpdb;

    $slug = esc_sql( $request['slug'] );
    $query = "SELECT * FROM $wpdb->posts p LEFT JOIN $wpdb->term_relationships tr"
          . " ON p.ID = tr.object_ID LEFT JOIN $wpdb->term_taxonomy tt"
          . " ON tt.term_taxonomy_id = tr.term_taxonomy_id LEFT JOIN $wpdb->terms t"
          . " ON t.term_id = tt.term_id LEFT JOIN $wpdb->options ON option_name = CONCAT('taxonomy_', t.term_id) "
          . " WHERE p.post_status = 'publish'"
          . " AND post_type = '{$slug}' ORDER BY CAST(description AS UNSIGNED), menu_order, post_title";

    $templates = $wpdb->get_results( $query );

    $response = [];
    $items = [];
    $categories = [];

    // The image are stored in the single template folder as:
    // [template-slug].jpg
    $addons = get_option( 'codepress_addons', array() );
    $base_url = $addons[ $slug ]['url'];
    foreach( $templates as $template ) {
      $category = $template->slug;

      $value = maybe_unserialize( $template->option_value );

      $categories[$template->slug] = array(
        'name' => $template->name,
        'icon' => isset( $value['icon'] ) ? $value['icon'] : '',
      );

      $items[ $category ][] = array(
        'id' => $template->ID,
        'title' => $template->post_title,
        'info' => html_entity_decode( $template->post_content ),
        'slug' => trailingslashit( $slug ) . $template->post_name,
        'endpoint' => 'template/' . trailingslashit( $slug ) . $template->post_name,
        // 'icon' => get_post_meta( $template->ID, 'icon', true ),
        // 'thumbnail' => get_the_post_thumbnail_url( $template->ID, 'thumbnail' ),
        'thumbnail' => $base_url . 'assets/templates/' . $category . '/' . $template->post_name . '.jpg',
      );
    }

    foreach( $items as $category => $data ) {
      $response[ 'templates' ][] = array(
        'category' => array(
          'title' => $categories[$category]['name'],
          'slug' => $category,
          'icon' => $categories[ $category ]['icon'],
        ),
        'items' => $data,
      );
    }

    //Return the info about the generator
    $response['generator'] = $this->get_generator_info($slug);

    $response = rest_ensure_response( $response );
    return $response;
  }

  /**
   * Get the post thumbnail url
   *
   * @param array $object Details of current post.
   * @param string $field_name Name of field.
   * @param WP_REST_Request $request Current request
   *
   * @return string
   */
  function get_thumbnail( $id ) {
    $url = get_post_meta( $id, 'plugin_url', true );

    return "{$url}/thumbnail.png";
  }

   /**
    * Return the category icon name.
    *
    */
  public function get_category_icon( $object, $field_name, $request ) {
    $t_id = $object['id'];
    $term_meta = get_option( "taxonomy_{$t_id}", '' );

    return is_array( $term_meta ) ? $term_meta['icon'] : "code";
  }

  /**
   * Get all the post of a specific post type
   *
   * This function return all the posts of a specific post type, ordered by
   * title.
   * Unlike the /templates/ endpoint, here no grouping is made
   *
   */
  public function get_post_type( $request ) {
    $route = explode('/', $request->get_route());
    $type = end( $route );
    $args = [
      'post_type' => $type,
      'posts_per_page' => -1,
      'orderby' => 'title',
      'order' => 'ASC',
      'post_status' => 'publish',
    ];

    $posts = new WP_Query( $args );
    $response = [];

    $post_type = get_post_type_object( $type );
    $isTemplate = $post_type->description != '';

    $endpoint_prefix = $isTemplate ? 'template' : $post_type->description;
    $prefix = empty( $endpoint_prefix ) ? '' : trailingslashit( $endpoint_prefix );

    //is /generators?
    $is_generators = 'generators' == $type;
    while( $posts->have_posts() ) {
      $posts->the_post();

      $slug = get_post_field( 'post_name' );
      $endpoint_url = $prefix . trailingslashit( $type ) . $slug;

      //$link is the HTTP url link to access to a specific template/page
      $link = $isTemplate ? "generators/$type/$slug" : $endpoint_url;

      // The image are stored in the single template folder as:
      // [template-slug].jpg
      $addons = get_option( 'codepress_addons', array() );
      $base_url = $addons[ $slug ]['url'];

      $post = [
        'id' => get_the_ID(),
        'title' => get_the_title(),
        'slug' => $slug,
        'endpoint' => $endpoint_url,
        'link' => home_url( '/#/' . $link ),
        // 'thumbnail' => get_the_post_thumbnail_url( get_the_ID(), 'full' ),
        'thumbnail' => $base_url . 'assets/logo.png',
        'description' => get_the_content(),
      ];

      if($is_generators) {
        $post['author'] = get_post_meta(get_the_ID(), 'plugin_author', true);
        $post['authorUri'] = get_post_meta(get_the_ID(), 'plugin_author_uri', true);
        $post['addonUri'] = get_post_meta(get_the_ID(), 'plugin_uri', true);
      }
      $response[] = $post;
    }

    return $response;
  }

  /**
   * Get template fields
   *
   * @param slug (string) generator slug
   * @param template (string) generator template slug (i.e. wordpress)
   *
   * @return array
   */
  function get_template( $request ) {
    $post = get_page_by_path( $request['slug'], ARRAY_A, $request['template'] );
    if( ! $post ) return array();

    //Get the generator data
    $addons = get_option( 'codepress_addons' );
    if( ! isset( $addons[ $request['template'] ] ) ) {
      return array( 'error' => 'No template found' );
    }

    /**
     * Each view is stored in their category subfolder
     */
    $slugs = wp_get_post_terms( $post['ID'], $request['template'] . '-category', array( 'fields' => 'slugs' ) );
    $path = trailingslashit( WP_CONTENT_DIR ) . "plugins/" .
            trailingslashit( $addons[ $request['template'] ][ 'folder' ] ) .
             "assets/templates/" .
            join( DIRECTORY_SEPARATOR, $slugs ) . DIRECTORY_SEPARATOR;

    $file = $path . $request['slug'] . ".fields.php";
    if( ! file_exists($file) ) error_log( 'Template not found: ' . $file );

    require_once( $file );

    $url = str_replace( ABSPATH, home_url( '/' ), $path );
    // $response = cp_get_response( $url );
    $response = $fn( $url );

    $template = [
      'id' => $post['ID'],
      'title' => $post['post_title'],
      'description' => html_entity_decode( $post['post_content'] ),
      'slug' => $post['post_name'],
      'endpoint' => 'generators/' . trailingslashit( $request['slug'] ) . $request['template'],
      'thumbnail' => get_the_post_thumbnail_url( $post['ID'], 'thumbnail' ),
    ];

    $default = [
      'title' => $post['post_title'],
      'code' => sprintf("%s%s.code.html", $url, $post['post_name'] ),
      'content' => $post['post_content'],
      'template' => $template,
      'generator' => $this->get_generator_info($request['template']),
      'category' => $slugs[0],
    ];

    return array_merge( $default, $response );
  }

  /**
   * Get the content of the codepress page
   *
   */
  function get_codepress_page( $request ) {
   $post = get_page_by_path( $request['slug'], ARRAY_A, 'codepress' );
   if( ! $post ) return array();

   $return = [
     'title' => $post['post_title'],
     'content' => $post['post_content'],
   ];

   return $return;
 }

  /**
   * Send code to / Get code...
   *
   * This function use for both HTTP verbs: GET, POST
   *
   * GET:
   *  - return the code associated to the token
   *  - delete the record from the db
   *
   * POST:
   *  - Increase the internal counter, just for statistics purpose.
   *  - Generate a random key
   *  - Store the code into the DB
   *  - Return the record ID
   *
   *  Post method access is restriceted to the current domain only.
   */
  public function send_code_to( $request ) {
    global $wpdb;

    if( 'POST' == $request->get_method() ) {
      $data = json_decode( $request->get_body() );
      $code = $data->code;
      $home_url = preg_replace( '/^http(s)?:\/\//', '', home_url() );

      //Restrict the access to the current domain
      /**
       * on siteground staging are home_url return the live website,
       * not stagingX.codepress.io.
       * So gonna remove http:// from $home_url
       */
      if( $_SERVER['SERVER_NAME'] != $home_url ) {
        return [ 'error' => 'Access denied' ];
      }

      if( empty( $data ) ) {
        return [ 'error', 'No data defined' ];
      }

      //counter
      codepress_increment_counter( COUNTER_SENDTO, $data->slug, $data->pageId );

      $token = md5(uniqid(rand(), true));
      $wpdb->insert(
        'cp_sendto',
        [
          'token' => $token,
          'data' => $code,
        ],
        [
          '%s',
          '%s',
        ]
      );

      return [ 'token' => $token ];
    } else {
      $token = $request['token'];

      $query = sprintf( "SELECT data FROM cp_sendto WHERE token = '%s'", esc_sql( $token ) );
      $data = $wpdb->get_var( $query );

      //Done, can delete it
      $wpdb->delete(
        'cp_sendto',
        [
          'token' => $token,
        ],
        [
          '%s',
        ]
      );

      return array_merge( [ 'data' => $data ] );
    }
  }

  /**
   * Update the statistic counter
   *
   */
  public function get_update_counter( $request ) {
    global $wpdb;

    if( 'POST' == $request->get_method() ) {
      $data = json_decode( $request->get_body() );
      $home_url = preg_replace( '/^http(s)?:\/\//', '', home_url() );

      //Restrict the access to the current domain
      if( $_SERVER['SERVER_NAME'] != $home_url ) {
        return [ 'error' => 'Access denied' ];
      }

      $action = '...testing...' == $_POST['action'] ? COUNTER_TESTING : COUNTER_CLIPBOARD;
      codepress_increment_counter( $action, $data->slug, $data->pageId );

      return [ 'done' => 1 ];
    } else {
      // $action = $request['action'];

      $clipboard_query = "SELECT generator, SUM(count) as total FROM cp_counters WHERE templateID > 0 AND action = 'clipboard' GROUP BY generator";
      $sendto_query = "SELECT generator, SUM(count) as total FROM cp_counters WHERE templateID > 0 AND action = 'sendto' GROUP BY generator";
      $clipboard = $wpdb->get_results( $clipboard_query );
      $sendto = $wpdb->get_results( $sendto_query );

      $totals = [];
      $total = $wpdb->get_results( "SELECT action, SUM(count) as total FROM cp_counters WHERE templateID > 0 GROUP BY action" );

      foreach( $total as $t ) {
        $totals[ $t->action ] = $t->total;
      }

      // $query = "SELECT * FROM cp_counters t1 INNER JOIN $wpdb->posts t2 ON t1.templateID = t2.ID"
      if( ! is_array( $clipboard ) ) $clipboard = array( $clipboard );
      if( ! is_array( $sendto ) ) $sendto = array( $sendto );
      if( ! is_array( $total ) ) $total = array( $total );

      $all = [
        'clipboard' => [
          'generators' => $clipboard,
          'total' => $totals['clipboard'],
        ],
        'sendto' => [
          'generators' => $sendto,
          'total' => $totals['sendto'],
        ],
        'total' => $totals['clipboard'] + $totals['sendto']
      ];

      return $all;
    }
  }

	/**
	 * Get the query params for collections
	 *
	 * @return array
	 */
	public function get_collection_params( $what = null ) {
    $query_params = array();

    switch( $what ) {
      case 'auth':
        $query_params['token'] = [
          'required' => true,
          'description'        => __( 'Token' ),
          'type'               => 'string',
          'default'            => '',
        ];
        break;
      case 'auth_post':
        $query_params['email'] = [
          'required' => true,
          'description'        => __( 'User email' ),
    			'type'               => 'string',
    			'default'            => '',
        ];

        $query_params['password'] = [
          'required' => true,
          'description'        => __( 'User password' ),
    			'type'               => 'string',
    			'default'            => '',
        ];

        break;
      case 'templates':
        $query_params['slug'] = [
          'required'           => true,
          'description'        => __( 'Generator name' ),
          'type'               => 'string',
          'default'            => '',
        ];

        break;
      case 'sendto':
        $query_params['token'] = [
          'required' => true,
          'description'        => __( 'Token used to retrieve the generated code' ),
          'type'               => 'string',
          'default'            => '',
        ];

        break;
      case 'single':
        $query_params['slug'] = [
          'required' => true,
          'description'        => __( 'Post slug' ),
          'type'               => 'string',
          'default'            => '',
        ];

        break;
    }

    return $query_params;
  }

  /**
   * Return the info about the specified generator
   */
  function get_generator_info($slug) {
    $generator = get_page_by_path($slug, OBJECT, 'generators');

    $info = [
      'id' => $generator->ID,
      'title' => $generator->post_title,
      'description' => html_entity_decode( $generator->post_content ),
      'slug' => $slug,
      'endpoint' => 'generators/' . $generator->post_name,
      'thumbnail' => get_the_post_thumbnail_url( $generator->ID, 'thumbnail' ),
    ];

    return $info;
  }

  /**
   * Retrieve the roadmap information
   */
  public function get_roadmap() {
    return cp_trello_get_roadmap();
  }

}

add_action( 'rest_api_init', function() {
  $cp_controller = new CodePress_Rest_Controller;
  $cp_controller->register_routes();
});

/**
 * Change the rest url prefix in /api
 *
 */
add_filter( 'rest_url_prefix', function() {
  return 'api';
});

/**
 * Remove show_in_rest property from posts, pages and attachments...
 *
 * The property is set by the wp-rest-api plugin, but don't need them
 * to be "exposed"
 */
add_action( 'init', function() {
  global $wp_post_types;

	if ( isset( $wp_post_types['post'] ) ) {
		$wp_post_types['post']->show_in_rest = false;
	}

	if ( isset( $wp_post_types['page'] ) ) {
		$wp_post_types['page']->show_in_rest = false;
	}

	if ( isset( $wp_post_types['attachment'] ) ) {
		$wp_post_types['attachment']->show_in_rest = false;
	}
}, 99);
