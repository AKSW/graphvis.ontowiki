<?php
/**
 * This file is part of the {@link http://ontowiki.net OntoWiki} project.
 *
 * @copyright Copyright (c) 2012, {@link http://aksw.org AKSW}
 * @license http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 */

/**
 * graphvis controller
 *
 * @category   OntoWiki
 * @package    OntoWiki_extensions_components_graphvis
 */
class GraphvisController extends OntoWiki_Controller_Component
{
    private $_relations;

    /**
     * receive a ping
     */
    public function indexAction()
    {
        $this->view->placeholder('main.window.title')->set('Graph Visualization');
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

        // add module
        $this->addModuleContext('main.window.graphvis');

        $this->_relations = array();

        // get resource info
        $resource    = $this->_owApp->selectedResource;
        $base        = (string)$resource;
        $baseName    = $resource->getTitle();
        $resultTree  = $this->getTreeRelations($base, $baseName, true);
        $resultGraph = $this->getGraphRelations($base, $baseName, true);

        $this->view->treeData      = $resultTree;
        $this->view->graphData     = $resultGraph;
        $this->view->relationsData = $this->_relations;
    }


    public function getchildrenAction()
    {
        $this->_helper->layout()->disableLayout();

        $base     = $this->_request->getParam('uri');
        $baseName = '';
        $result   = $this->getTreeRelations($base, $baseName);

        echo json_encode($result);
    }

    public function getrelationsAction()
    {
        $this->_helper->layout()->disableLayout();

        $base     = $this->_request->getParam('uri');
        $baseName = '';
        $result   = $this->getGraphRelations($base, $baseName);

        echo json_encode($result);
    }

    protected function getTreeRelations($base, $baseName, $fetchRelations = false)
    {
        $query = '
            PREFIX aksw: <http://aksw.org/schema/> .
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
            SELECT ?relation ?object ?class
            WHERE {
                <'.$base.'> ?relation ?object .
                OPTIONAL { ?object rdf:type ?class }
                FILTER ( isIRI(?object) )
            }';
        //echo $query; die;
        $relationsQuery = Erfurt_Sparql_SimpleQuery :: initWithString($query);
        $relationsResult = $this->_owApp->selectedModel->sparqlQuery($relationsQuery);

        $namesArray = array();
        foreach ($relationsResult as $res) {
            if ($fetchRelations && !in_array($res['relation'], $this->_relations)) {
                $this->_relations[] = $res['relation'];
            }
            $namesArray[$res['object']] = array('name' => '', 'rel' => $res['relation'], 'class' => $res['class']);
        }

        // add uris to title helper
        $titleHelper = new OntoWiki_Model_TitleHelper($this->_owApp->selectedModel);
        $titleHelper->addResources(array_keys($namesArray));

        // get names
        $result = array('name' => $baseName, 'children' => array());
        foreach ($namesArray as $uri => $obj) {
            $title = $titleHelper->getTitle($uri);

            if (null !== $title) {
                $result['children'][] = array(
                    'name' => $title,
                    'uri' => $uri,
                    'relation' => $obj['rel'],
                    'class' => $obj['class']
                );
            } else {
                $result['children'][] = array(
                    'name' => OntoWiki_Utils::compactUri($uri),
                    'uri' => $uri,
                    'relation' => $obj['rel'],
                    'class' => $obj['class']
                );
            }
        }

        //echo "<pre>";
        //print_r($result); die;
        return $result;
    }

    protected function getGraphRelations($base, $baseName, $fetchRelations = false)
    {
        $query = '
            PREFIX aksw: <http://aksw.org/schema/> .
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
            SELECT ?relation ?object ?class
            WHERE {
                <'.$base.'> ?relation ?object .
                OPTIONAL { ?object rdf:type ?class }
                FILTER ( isIRI(?object) )
            }';
        //echo $query; die;
        $relationsQuery = Erfurt_Sparql_SimpleQuery :: initWithString($query);
        $relationsResult = $this->_owApp->selectedModel->sparqlQuery($relationsQuery);

        $namesArray = array();
        foreach ($relationsResult as $res) {
            if ($fetchRelations && !in_array($res['relation'], $this->_relations)) {
                $this->_relations[] = $res['relation'];
            }
            $namesArray[$res['object']] = array('name' => '', 'rel' => $res['relation'], 'class' => $res['class']);
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
                    'target' => $title, 'targetUri' => $uri,
                    'relation' => $obj['rel'],
                    'class' => $obj['class']
                );
            } else {
                $result[] = array(
                    'source' => $baseName, 'sourceUri' => $base,
                    'target' => OntoWiki_Utils::compactUri($uri), 'targetUri' => $uri,
                    'relation' => $obj['rel'],
                    'class' => $obj['class']
                );
            }
        }

        //echo "<pre>";
        //print_r($result); die;
        return $result;
    }
}
