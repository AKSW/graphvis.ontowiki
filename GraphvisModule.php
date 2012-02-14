<?php

/**
 * OntoWiki module – graphvis
 *
 * Extends graphvis with additional controls
 *
 * @category   OntoWiki
 * @package    OntoWiki_extensions_modules_comment
 * @author     Tim Ermilov <yamalight@gmail.com>
 * @copyright  Copyright (c) 2012, {@link http://aksw.org AKSW}
 * @license    http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 */
class GraphvisModule extends OntoWiki_Module
{
    public function getTitle()
    {
        return 'GrahpVis';
    }
    
    public function getContents()
    {
        $content = $this->render('graphvis');
		
		return $content;
    }
}

