<?php
/**
 * Simple TRELLO API integration.
 *
 * The below code purpose is only to retrieve the data from the trello board
 * associated to this project.
 * Each board card represent a milestone, and each field label represent
 */
$data = @file_get_contents( get_template_directory() . "/.trello");
$trello_auth = json_decode($data);

/**
 * Get the information from trello
 */
function cp_trello_get ($action) {
  global $trello_auth;

  $url = "https://api.trello.com/1/$action";
  $url = add_query_arg([
    'key' => $trello_auth->KEY,
    'token' => $trello_auth->TOKEN,
  ], $url);

  # init curl
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $url);
  //curl_setopt($ch, CURLOPT_POSTFIELDS, $encoded_fields);
  curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/4.0 (compatible; MSIE 5.01; Windows NT 5.0)");
  curl_setopt($ch, CURLOPT_HEADER, false);
  curl_setopt($ch, CURLINFO_HEADER_OUT, false );
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_TIMEOUT, 0);
  //curl_setopt($ch, CURLOPT_POST, 1);

  # dont care about ssl
  curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

  # download and close
  $output = curl_exec($ch);
  $request =  curl_getinfo($ch, CURLINFO_HEADER_OUT);
  $error = curl_error($ch);
  curl_close($ch);


  return json_decode($output);
}

/**
 * The roadmap is stored as trello board.
 */
function cp_trello_get_roadmap() {
  global $trello_auth;

  $board_id = null;

  // Retrieve the board id
  /*
   * TODO: replace with a method that return the board id, if exists
   */
  $boards = cp_trello_get("members/{$trello_auth->MEMBER}/boards");
  // $url = "https://api.trello.com/1/members/{$trello_auth->MEMBER}/boards?key={$trello_auth->KEY}&token={$trello_auth->TOKEN}";

  foreach($boards as $board) {
    if($board->name == 'codepress.io') {
      $board_id = $board->id;

      break;
    }
  }

  if(null == $board_id) return [];

  // Retrieve the board lists
  $lists = cp_trello_get("boards/{$board_id}/lists");
  foreach($lists as &$list) {
    $list->items = cp_trello_get("lists/{$list->id}?fields=name&cards=open&card_fields=name,labels");
  }

  return $lists;
}
