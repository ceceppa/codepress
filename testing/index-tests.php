<ul>
<?php
$tests = glob(dirname(__FILE__) . '/spec/cp_*.js');

foreach( $tests as $test ) {
  preg_match("/cp_(.*).js/", basename($test), $name);

  $title = ucfirst(str_replace('-', ' ', $name[1]));
  printf('<li><a href="%s">%s</a></li>', esc_url( add_query_arg( array('test' => $name[1] ) ) ), $title );
}
?>
</ul>
