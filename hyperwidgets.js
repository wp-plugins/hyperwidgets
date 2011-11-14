/*
Plugin Name: HyperWidgets
Plugin URI: http://wordpress.org/extend/plugins/hyperwidgets/
Author: Andreas Ek, Hypernode AB
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

jQuery(document).ready(function($) {
	// A var for json data
	$jsonData = '';
	$sideBars = $('#widgets-right .widgets-holder-wrap');
	//save the id of the group to send to server
	$modifyId = 0;
	// Writing the Panel
	var html  = '<div class="widgets-holder-wrap">';
		html += '<div class="sidebar-name"><div class="sidebar-name-arrow"><br></div><h3>HyperWidgets</h3></div>';
		html += '<div id="sidebar-hyper-sidebars" class="widgets-sortables ui-sortable" style="min-height: 50px; ">';
		html += '<div class="sidebar-description">';
		html += '<p class="description">Select group of widget areas:</p>';
		html += '<p><select id="hyper-sidebars"><option>--- Show All ---</option></select>&nbsp;';
		html += '<a href="#" id="hyperwidgets_input_button">Edit group</a></p>';
		html += '<div class="hyperwidgets_group">';
		html += '<p class="description">Name:</p>';
		html += '<input id="hyperwidgets_name" type="text"/><p>';
		$('#widgets-right .widgets-holder-wrap').each(function(index) {
			var id = $(this).find('.widgets-sortables').attr('id');
			var name = $('.sidebar-name h3', this).text();
			if(index >= 0) {
				html += '<input class="hyperwidgets_groupcheck" type="checkbox" value="' + id + '" />&nbsp;' + name + '<br/>';
			}
		});
		html += '</p>';
		html += '<p><input type="button" value="Save group" id="hyperwidgets_input_save" /><input id="hyperwidgets_input_remove" type="button" value="Unassign group" /></p>';
		html += '</div><div id="hyperwidgets_data"></div>';
		html += '</div></div></div>';

	$('#widgets-right').prepend(html);
	
	// Slide down editing box
	$('#hyperwidgets_input_button').click(function() {
		$('.hyperwidgets_group').slideDown();
	});
	
	//SAVE
	$('#hyperwidgets_input_save').click(function() {
		//save name and areas
		var name = $('#hyperwidgets_name').val();
		var areas = '';
		//loop through checkboxes
		$('.hyperwidgets_groupcheck').each(function(index) {
			if (index >= 0) {
				//if not an emtpty string
				if (areas != '') areas += ' ';
				//add checkbox value to string
				if ($(this).attr('checked')) areas += $(this).val();
			}
		});
		//save group
		hyperwidgets_set_group($modifyId, name, areas);
		$('.hyperwidgets_group').slideUp();
	});
	
	//UNASSIGN
	$('#hyperwidgets_input_remove').click(function() {
		//unassign
		hyperwidgets_set_group($modifyId, 'name', 'unassign');
		$('.hyperwidgets_group').slideUp();
	});
	
	//show widgets according to selectbox
	$('select#hyper-sidebars').change(function() {

		hyper_widgets_show($('select#hyper-sidebars option:selected').attr('value'));
		if ($('select#hyper-sidebars').val() == '--- Show All ---') {
			hyper_widgets_show('all');
		}
		//populate edit form
		if($('#hyper-sidebars').val() != '' && $('#hyper-sidebars').val() != '--- Show All ---'){
			//find text to use in textfield
			$modify = $('#hyper-sidebars').find('option[value="'+$('#hyper-sidebars').val()+'"]').text();
			//change modifyid
			$modifyId = $('#hyper-sidebars').val();
			//loop jsonData
			$($jsonData).each(function(key, value){
				$('#hyperwidgets_name').val($modify);
				//check checkboxes for group
				if ($('#hyper-sidebars').val() == value.id){
					$('.hyperwidgets_groupcheck').attr('checked',false);
					//get all sidebars in group
					$areasArray = value.areas.split(' ');
					//loop sidebars in group
					$($areasArray).each(function(number, val){
						//checked if exist in group
						$('.hyperwidgets_groupcheck').each(function(){
							if ($(this).val() == val){
								$(this).attr('checked','checked');
							}
						})
					});
				};
			});
		}else{
			//if no group
			$modifyId = 0;
			$('.hyperwidgets_groupcheck').attr('checked',false);
			$('#hyperwidgets_name').val('');
		}
	});
	
	// Functions
	//show sidebars
	hyper_widgets_show = function(id) {
		//Hides all sidebars
		hyper_widgets_hide();
		//show all
		if(id == 'all') {
			$('#widgets-right .widgets-holder-wrap').each(function(index) {
				if(index > 0)
					$(this).show();
			});
		} else {
			//loop jsonData for sidebars
			$jsonData.each(function(key, value){
				if (value.id == id) {
					$areasArray = value.areas.split(' ');
					$($areasArray).each(function(number, val){
						$($sideBars).each(function(){
							if($(this).find('.widgets-sortables').attr('id') == val){
								//display sidebar if is in group
								$(this).show();
							}else{
								
							}
						});
					});
				};
			});
		}
	}
	
	//hides sidebars
	hyper_widgets_hide = function() {
		$('#widgets-right .widgets-holder-wrap').each(function(index) {
			if(index > 0)
				$(this).addClass('closed').hide();
		});
	}

	//get groups and put in select
	hyperwidgets_get_groups = function() {
		//removes old
		$('#hyper-sidebars option').each(function(){
			if($(this).text() != '--- Show All ---'){
				$(this).remove();
			}
		});
		var result = '';
		var data = {
			action : 'hyperwidgets_get_groups'
		};
		/* Sending an GET request: */
		jQuery.get(HyperWidgetsAjax.ajaxurl, data, function(msg) {
			
			result = msg.replace(/.*<json>(.*?)<\/json>.*/ig, "$1");
			//populates selectbox
			if (result != '') {
				json = jQuery.parseJSON(result);
				$jsonData = $(json);
				$.each(json, function(key, value) {
					console.log(value)
					$('select#hyper-sidebars').append(
						$('<option></option>').
							attr('value', value.id).
							text(value.groupname)
					);
				});
			};
		});
	}
	//initial get groups
	hyperwidgets_get_groups();

	//save group
	hyperwidgets_set_group = function(_id, _name, _areas) {
		var result = '';
		var data = {
			action : 'hyperwidgets_set_group',
			id : _id,
			groupname : _name,
			areas : _areas
		};
		/* Sending an AJAX POST request: */
		jQuery.post(HyperWidgetsAjax.ajaxurl, data, function(msg) {
			result = msg.replace(/.*<json>(.*?)<\/json>.*/ig, "$1");
			//get groups
			hyperwidgets_get_groups();
		});
		//set modify id to zero
		$modifyId = 0;
		

	}


	
});
