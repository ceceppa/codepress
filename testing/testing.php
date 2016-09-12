<?php
/**
 * Template name: Testing
 */
?>
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Jasmine Spec Runner v2.4.1</title>

  <link rel="shortcut icon" type="image/png" href="<?php echo get_template_directory_uri() ?>/testing/lib/jasmine-2.4.1/jasmine_favicon.png">
  <link rel="stylesheet" href="<?php echo get_template_directory_uri() ?>/testing/lib/jasmine-2.4.1/jasmine.css">

  <?php
  $HOME_URL = "http://" . $_SERVER['SERVER_NAME'] . $_SERVER['REQUEST_URI'];
  $API_URL = 'http://' . $_SERVER['SERVER_NAME'] . '/api/v1/';
  ?>
  <script>BG_URL = '<?php echo $API_URL ?>';</script>

  <?php wp_head(); ?>
</head>

<body>
</body>
<script src="<?php echo get_template_directory_uri() ?>/testing/spec/APIHelper.js"></script>

<?php
/**
 * If no "test" parameter is set in the URL, show the list of all available tests.
 */
if( isset( $_GET['test'] ) ) :

  $boiler_url = $API_URL . 'generators';

  if( function_exists('curl_init') ) {
    $curlSession = curl_init();
    curl_setopt($curlSession, CURLOPT_URL, $boiler_url);
    curl_setopt($curlSession, CURLOPT_RETURNTRANSFER, true);

    $generators = curl_exec($curlSession);
    curl_close($curlSession);
  } else {
    $generators = file_get_contents( $boiler_url );
  }

  $templates = [];
  $addons = [];
  foreach( json_decode($generators) as $generator ) {
    $templates[ $generator->slug ] = json_decode(file_get_contents( $API_URL . 'generators/' . $generator->slug ));
    $addons[ $generator->slug ] = dirname($generator->thumbnail) . '/';
  }

  ?>
  <script src="<?php echo get_template_directory_uri() ?>/testing/lib/jasmine-2.4.1/jasmine.js"></script>
  <script src="<?php echo get_template_directory_uri() ?>/testing/lib/jasmine-2.4.1/jasmine-html.js"></script>
  <script src="<?php echo get_template_directory_uri() ?>/testing/lib/jasmine-2.4.1/boot.js"></script>

  <!-- jQuery -->
  <script src="https://code.jquery.com/jquery-2.2.3.min.js"></script>

  <script>
    var generators = <?php echo $generators ?>;
    var templates = <?php echo json_encode($templates) ?>;
    var codepress = {
      "home": '<?php echo $HOME_URL ?>',
      "assets": '<?php echo $HOME_URL ?>/wp-content/themes/codepress/assets/',
      "views": '<?php echo $HOME_URL ?>/wp-content/themes/codepress/views/',
      "root": '<?php echo $HOME_URL ?>/wp-content/themes/codepress/',
      "addon": <?php echo json_encode( $addons ); ?>,
      "version":"1.0",
      "api": '<?php echo $API_URL ?>'
    };
  </script>

  <?php
  $list = [ basename( $_GET['test'] ) ];
  if( $_GET['test'] == 'all' ) {
    $tests = glob(dirname(__FILE__) . '/spec/cp_*.js');
    $list = [];

    foreach( $tests as $test ) {
      preg_match("/cp_(.*).js/", basename($test), $name);

      $list[] = basename( $name[1] );
    }
  }

  foreach( $list as $js ) {
    echo '<script src="' . get_template_directory_uri() . '/testing/spec/cp_' . $js . '.js"></script>';
  }

else:

  require_once( 'index-tests.php');

endif;
?>

<footer>
<?php wp_footer(); ?>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.5.8/angular-mocks.js"></script>

</footer>
</body>
</html>
