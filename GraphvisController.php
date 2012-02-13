<?php
/**
 * semantic pingback controller
 *
 * @category   OntoWiki
 * @package    OntoWiki_extensions_components_pingback
 * @copyright  Copyright (c) 2011, {@link http://aksw.org AKSW}
 * @license    http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 */

require_once 'OntoWiki/Model/TitleHelper.php';

class GraphvisController extends OntoWiki_Controller_Component {
    /**
     * receive a ping
     */
    public function indexAction() {
		// disable tabs
        OntoWiki_Navigation::disableNavigation();

		// self url
		$url = OntoWiki::getInstance()->extensionManager->getComponentUrl('graphvis');
                                                                       
	   	// css
		$this->view->headLink()->appendStylesheet($url . 'resources/css/main.css');
		// js libs
		$this->view->headScript()->appendFile($url . 'resources/libs/d3.min.js');
		$this->view->headScript()->appendFile($url . 'resources/libs/d3.geom.min.js');
        $this->view->headScript()->appendFile($url . 'resources/libs/d3.layout.min.js');
		// my js
		$this->view->headScript()->appendFile($url . 'resources/js/main.js');
		$this->view->headScript()->appendFile($url . 'resources/js/tree.js');
		$this->view->headScript()->appendFile($url . 'resources/js/graph.js');
		
		$base = "http://aksw.org/Projects/OntoWiki";
		$baseName = "OntoWiki";
		$resultTree = $this->getTreeRelations($base, $baseName); 
		$resultGraph = $this->getGraphRelations($base, $baseName); 
		
		$this->view->treeData = $resultTree;
		$this->view->graphData = $resultGraph;
    }

	
	public function getchildrenAction(){
		$this->_helper->layout()->disableLayout();
		
		$base = $_GET['uri'];
		$baseName = '';
		$result = $this->getTreeRelations($base, $baseName); 
		
		echo json_encode($result);
	}
	   
	public function getrelationsAction(){
		$this->_helper->layout()->disableLayout();
		
		$base = $_GET['uri'];
		$baseName = '';
		$result = $this->getGraphRelations($base, $baseName); 
		
		echo json_encode($result);
	}
	
	protected function getTreeRelations($base, $baseName){
		$query = '
			PREFIX aksw: <http://aksw.org/schema/> .
			SELECT ?relation ?object 
			WHERE {
				<'.$base.'> ?relation ?object .
				FILTER sameTerm(?relation, aksw:relatedProject)
			}';
		//echo $query; die;
        $relationsQuery = Erfurt_Sparql_SimpleQuery :: initWithString($query);
        $relationsResult = $this->_owApp->selectedModel->sparqlQuery($relationsQuery);
		
		$namesArray = array();
		foreach($relationsResult as $res){
			$namesArray[$res['object']] = array('name' => '', 'rel' => $res['relation']);
		}
		
		// add uris to title helper
		$titleHelper = new OntoWiki_Model_TitleHelper($this->_owApp->selectedModel);
		$titleHelper->addResources(array_keys($namesArray));
		
		// get names
		$result = array('name' => $baseName, 'children' => array());
        foreach ($namesArray as $uri => $obj) {
            $title = $titleHelper->getTitle($uri);

            if (null !== $title) {
                $result['children'][] = array('name' => $title, 'uri' => $uri );
            } else {
                $result['children'][] = array('name' => OntoWiki_Utils::compactUri($uri), 'uri' => $uri );
            }
        }

		//echo "<pre>";
		//print_r($result); die;
		return $result;
	}
	
	protected function getGraphRelations($base, $baseName){
		$query = '
			PREFIX aksw: <http://aksw.org/schema/> .
			SELECT ?relation ?object 
			WHERE {
				<'.$base.'> ?relation ?object .
				FILTER sameTerm(?relation, aksw:relatedProject)
			}';
		//echo $query; die;
        $relationsQuery = Erfurt_Sparql_SimpleQuery :: initWithString($query);
        $relationsResult = $this->_owApp->selectedModel->sparqlQuery($relationsQuery);
		
		$namesArray = array();
		foreach($relationsResult as $res){
			$namesArray[$res['object']] = array('name' => '', 'rel' => $res['relation']);
		}
		
		// add uris to title helper
		$titleHelper = new OntoWiki_Model_TitleHelper($this->_owApp->selectedModel);
		$titleHelper->addResources(array_keys($namesArray));
		
		// get names
		$result = array();
        foreach ($namesArray as $uri => $obj) {
            $title = $titleHelper->getTitle($uri);

            if (null !== $title) {
                $result[] = array(
					'source' => $baseName, 'sourceUri' => $base, 
					'target' => $title, 'targetUri' => $uri
				);
            } else {
                $result[] = array(
					'source' => $baseName, 'sourceUri' => $base, 
					'target' => OntoWiki_Utils::compactUri($uri), 'targetUri' => $uri 
				);
            }
        }

		//echo "<pre>";
		//print_r($result); die;
		return $result;
	}
}
