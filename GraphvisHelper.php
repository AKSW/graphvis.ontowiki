<?php
/**
 * This file is part of the {@link http://ontowiki.net OntoWiki} project.
 *
 * @copyright Copyright (c) 2012, {@link http://aksw.org AKSW}
 * @license http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 */

/**
 * graphvis helper
 *
 * @category   OntoWiki
 * @package    OntoWiki_extensions_components_graphvis
 */
class GraphvisHelper extends OntoWiki_Component_Helper
{
    public function init()
    {
        // get current request info
        $request  = Zend_Controller_Front::getInstance()->getRequest();

        if (
            (
                $request->getControllerName() == 'resource'
                && $request->getActionName() == 'instances'
            ) || (
                $request->getControllerName() == 'resource'
                && $request->getActionName() == 'instances'
                && $request->getParam('mode') == 'multi'
            )
        ) {
            OntoWiki::getInstance()->getNavigation()->register(
                'graphvis',
                array(
                    'controller' => 'graphvis',
                    'action'     => 'index',
                    'name'       => 'GraphVis',
                    'priority'   => 50
                )
            );
        } else {
            OntoWiki::getInstance()->getNavigation()->register(
                'graphvis', array(
                    'controller' => 'graphvis',
                    'action'     => 'index',
                    'name'       => 'GraphVis',
                    'priority'   => 50
                )
            );
        }
    }
}
