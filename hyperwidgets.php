<?php
/*
Plugin Name: Hyperwidgets
Plugin URI: http://wordpress.org/extend/plugins/hyperwidgets/
Description: An interface addition for Widgets to let you group your Sidebars, eg for each page template.
Version: 1.0
Author: Andreas Ek & Johan Ahlbäck, Hypernode AB
Author URI: http://hypernode.se
License: GPL2
*/

/*  This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License, version 2, as 
    published by the Free Software Foundation.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/

//load scripts
add_action('admin_init', 'hyperwidgets_script');

//functions for AJAX
add_action('wp_ajax_hyperwidgets_get_groups', 'hyperwidgets_ajax_get_groups');
add_action('wp_ajax_hyperwidgets_set_group', 'hyperwidgets_ajax_set_group');

function hyperwidgets_script() {

	wp_register_style('hyperwidgets-styles', plugins_url('hyperwidgets.css', __FILE__) );
	
    /* Register our plugin page */
    $page = add_submenu_page( 'widgets.php', 
                              __( 'HyperWidgets', 'hyperwidgets' ), 
                              __( 'HyperWidgets', 'hyperwidgets' ),
                              'administrator',
                              __FILE__, 
                              'my_plugin_manage_menu' );
  
    /* Using registered $page handle to hook stylesheet loading */
    add_action( 'admin_print_styles-' . $page, 'hyperwidgets_admin_styles' );
	
	wp_enqueue_style( 'hyperwidgets-styles' );
	//enque script
	$myScriptUrl = WP_PLUGIN_URL . '/hyperwidgets/hyperwidgets.js';
    wp_deregister_script( 'hyperwidgetsjs' );
    wp_register_script( 'hyperwidgetsjs', $myScriptUrl);
    wp_enqueue_script( 'hyperwidgetsjs' );

    wp_localize_script( 'hyperwidgetsjs', 'HyperWidgetsAjax', array( 'ajaxurl' => admin_url( 'admin-ajax.php' ) ) );
	
}

//get groups (AJAX CALL)
function hyperwidgets_ajax_get_groups() {
	$json = get_option('hyperwidgets_json');
	echo '<json>'.$json.'</json>';
}

//set group (AJAX CALL)
function hyperwidgets_ajax_set_group() {
	$id 		= $_POST['id'];
	$groupname	= $_POST['groupname'];
	$areas 		= $_POST['areas'];
	$json 		= get_option('hyperwidgets_json');
	
	//if new:
	if (!$json && $json == '') {
		$arr = array(array('id' => 1,'groupname' => $groupname,'areas' => $areas));
		$arr = json_encode($arr);
		add_option('hyperwidgets_json', $arr);
	}
	else //add or modify
	{
		$arr = json_decode($json);
		if ($id==0) { //new
				//extra security check
				if ($areas != 'unassign') {
					//push to array
					$arr[] = array('id' => sizeof($arr)+1,'groupname' => $groupname,'areas' => $areas);
					//encode and save
					$arr = json_encode($arr);
					update_option('hyperwidgets_json', $arr);
				}
				
		}
		else{ //modify
			//loop and find group 
			foreach ($arr as $key => $value) {
				if($value->id == $id){
					//remove group
					if ($areas == 'unassign') {
						//unset group from array
						unset($arr[$key]);
						//reset loop index
						$arr = array_values($arr);
						break;
					}else{
						//set values
						$value->groupname = $groupname;
						$value->areas = $areas;
						break;
					}						
				}
			}
			//add json to database
			$arr = json_encode($arr);
			update_option('hyperwidgets_json', $arr);
		}
	}
}
?>